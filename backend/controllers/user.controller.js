import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
export const register = async(req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
}
export const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map(async(postId) => {
                const post = await Post.findById(postId);
                if (post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};
export const logout = async(_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};
export const getProfile = async(req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({ path: 'posts', createdAt: -1 }).populate('bookmarks');
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const editProfile = async(req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};
export const getSuggestedUsers = async(req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};
export const getSearch = async(req, res) => {
    try {
        const query = req.params.query; // Get query from params
        let search;
        if (query && query.trim()) {
            // Search by username or email (case-insensitive)
            search = await User.find({
                _id: { $ne: req.id },
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            }).select("-password");
        } else {
            // If no query, just return all users except current
            search = await User.find({ _id: { $ne: req.id } }).select("-password");
        }
        
        if (!search) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: search
        })
    } catch (error) {
        console.log(error);
    }
};

export const followOrUnfollow = async(req, res) => {
    try {
        const followerId = req.id; // The person trying to follow/unfollow (Patel)
        const followeeId = req.params.id; // The person being followed/unfollowed (Shivani)

        if (followerId === followeeId) {
            return res.status(400).json({
                message: 'You cannot follow or unfollow yourself.',
                success: false
            });
        }

        // Fetch both users in parallel for optimization
        const [follower, followee] = await Promise.all([
            User.findById(followerId).select("-password"),
            User.findById(followeeId).select("-password")
        ]);

        if (!follower || !followee) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        }

        // Check if already following
        const isFollowing = follower.following.includes(followeeId);
        if (isFollowing) {
            // Unfollow logic
            await Promise.all([
                User.findByIdAndUpdate(followerId, { $pull: { following: followeeId } }),
                User.findByIdAndUpdate(followeeId, { $pull: { followers: followerId } })
            ]);

            // Emit unfollow notification
            const notification = {
                type: 'unfollow',
                userId: followerId,
                userDetails: follower,
                message: `${follower.username} unfollowed you`
            };
            const receiverSocketId = getReceiverSocketId(followeeId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('notification', notification);
            }

            return res.status(200).json({
                message: 'Unfollowed successfully.',
                success: true
            });
        } else {
            // Follow logic
            await Promise.all([
                User.findByIdAndUpdate(followerId, { $push: { following: followeeId } }),
                User.findByIdAndUpdate(followeeId, { $push: { followers: followerId } })
            ]);

            // Emit follow notification
            const notification = {
                type: 'follow',
                userId: followerId,
                userDetails: follower,
                message: `${follower.username} started following you`
            };
            const receiverSocketId = getReceiverSocketId(followeeId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('notification', notification);
            }

            return res.status(200).json({
                message: 'Followed successfully.',
                success: true
            });
        }

    } catch (error) {
        console.log('Error in follow/unfollow logic:', error);
        return res.status(500).json({
            message: 'An error occurred. Please try again later.',
            success: false,
        });
    }
};

// export const followOrUnfollow = async(req, res) => {
//         try {
//             const followKrneWala = req.id; // Akshay
//             const jiskoFollowKrunga = req.params.id; // Ved
//             if (followKrneWala === jiskoFollowKrunga) {
//                 return res.status(400).json({
//                     message: 'You cannot follow/unfollow yourself',
//                     success: false
//                 });
//             }

//             const user = await User.findById(followKrneWala);
//             const targetUser = await User.findById(jiskoFollowKrunga);

//             if (!user || !targetUser) {
//                 return res.status(400).json({
//                     message: 'User not found',
//                     success: false
//                 });
//             }
//             // mai check krunga ki follow krna hai ya unfollow
//             const isFollowing = user.following.includes(jiskoFollowKrunga);
//             if (isFollowing) {
//                 // unfollow logic ayega
//                 await Promise.all([
//                     User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
//                     User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } }),
//                 ])
//                 return res.status(200).json({ message: 'Unfollowed successfully', success: true });
//             } else {
//                 // follow logic ayega
//                 await Promise.all([
//                     User.updateOne({ _id: followKrneWala }, { $push: { following: jiskoFollowKrunga } }),
//                     User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followKrneWala } }),
//                 ])
//                 return res.status(200).json({ message: 'followed successfully', success: true });
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }




// export const followOrUnfollow = async(req, res) => {
//     try {
//         const followerId = req.id; // The person trying to follow/unfollow (Patel)
//         const followeeId = req.params.id; // The person being followed/unfollowed (Shivani)

//         if (followerId === followeeId) {
//             return res.status(400).json({
//                 message: 'You cannot follow or unfollow yourself.',
//                 success: false
//             });
//         }

//         // Fetch both users in parallel for optimization
//         const [follower, followee] = await Promise.all([
//             User.findById(followerId),
//             User.findById(followeeId)
//         ]);

//         if (!follower || !followee) {
//             return res.status(404).json({
//                 message: 'User not found.',
//                 success: false
//             });
//         }

//         // Check if already following
//         const isFollowing = follower.following.includes(followeeId);

//         if (isFollowing) {
//             // Unfollow logic
//             await Promise.all([
//                 User.findByIdAndUpdate(followerId, { $pull: { following: followeeId } }),
//                 User.findByIdAndUpdate(followeeId, { $pull: { followers: followerId } })
//             ]);

//             return res.status(200).json({
//                 message: 'Unfollowed successfully.',
//                 success: true
//             });
//         } else {
//             // Follow logic
//             await Promise.all([
//                 User.findByIdAndUpdate(followerId, { $push: { following: followeeId } }),
//                 User.findByIdAndUpdate(followeeId, { $push: { followers: followerId } })
//             ]);

//             return res.status(200).json({
//                 message: 'Followed successfully.',
//                 success: true
//             });
//         }

//     } catch (error) {
//         console.log('Error in follow/unfollow logic:', error);
//         return res.status(500).json({
//             message: 'An error occurred. Please try again later.',
//             success: false,
//         });
export const getActivity = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // Get posts from followed users
        const followedUserIds = user.following;

        // Get posts from followed users and populate author and comments
        const posts = await Post.find({ author: { $in: followedUserIds } })
            .populate('author', 'username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            })
            .sort({ createdAt: -1 });

        // Get recent comments from followed users
        const comments = await Comment.find({ author: { $in: followedUserIds } })
            .populate('author', 'username profilePicture')
            .populate('post')
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({
            success: true,
            posts,
            comments
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An error occurred while fetching activity.",
            success: false
        });
    }
};