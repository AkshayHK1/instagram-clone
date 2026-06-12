import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { followUser, unfollowUser } from '@/redux/authSlice';
import axios from 'axios';

const SuggestedUsers = () => {
    const dispatch = useDispatch();
    const { suggestedUsers, user } = useSelector(store => store.auth);
    
    const handleFollowUnfollow = async (targetUserId) => {
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/user/followorunfollow/${targetUserId}`, {}, { withCredentials: true });
            if (res.data.success) {
                const isFollowing = user?.following?.includes(targetUserId);
                if (isFollowing) {
                    dispatch(unfollowUser(targetUserId));
                } else {
                    dispatch(followUser(targetUserId));
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    
    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {
                suggestedUsers.map((suggUser) => {
                    const isFollowing = user?.following?.includes(suggUser._id);
                    return (
                        <div key={suggUser._id} className='flex items-center justify-between my-5'>
                            <div className='flex items-center gap-2'>
                                <Link to={`/profile/${suggUser?._id}`}>
                                    <Avatar>
                                        <AvatarImage src={suggUser?.profilePicture} alt="post_image" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <h1 className='font-semibold text-sm'><Link to={`/profile/${suggUser?._id}`}>{suggUser?.username}</Link></h1>
                                    <span className='text-gray-600 text-sm'>{suggUser?.bio || 'Bio here...'}</span>
                                </div>
                            </div>
                            <span 
                                className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]'
                                onClick={() => handleFollowUnfollow(suggUser._id)}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </span>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default SuggestedUsers