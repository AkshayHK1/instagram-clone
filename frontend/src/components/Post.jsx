import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post?._id}/bookmark`, {withCredentials:true});
            if(res.data.success){
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const likeAnimation = {
        transform: liked ? 'scale(1.2)' : 'scale(1)',
        transition: 'all 0.2s ease'
    };

    return (
        <div className='my-8 w-full max-w-xl mx-auto border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm'>
            <div className='flex items-center justify-between p-4'>
                <div className='flex items-center gap-3'>
                    <Avatar className='w-10 h-10 border border-gray-200'>
                        <AvatarImage src={post.author?.profilePicture} alt={post.author?.username} />
                        <AvatarFallback>{post.author?.username?.substring(0, 2).toUpperCase() || 'CN'}</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-3'>
                        <h1 className='font-semibold text-sm'>{post.author?.username}</h1>
                       {user?._id === post.author._id &&  <Badge variant="secondary" className="text-xs">Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer hover:scale-110 transition-transform duration-200' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center rounded-2xl border-0 shadow-2xl">
                        {
                        post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-full text-[#ED4956] font-semibold border-b border-gray-100 rounded-none py-4">Unfollow</Button>
                        }
                        
                        <Button variant='ghost' className="cursor-pointer w-full border-b border-gray-100 rounded-none py-4">Add to favorites</Button>
                        {
                            user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-full text-[#ED4956] font-semibold rounded-none py-4">Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <div className="w-full aspect-square overflow-hidden">
                <img
                    className='w-full h-full object-cover'
                    src={post.image}
                    alt={post.caption}
                />
            </div>

            <div className='flex items-center justify-between p-4 pb-2'>
                <div className='flex items-center gap-5'>
                    <div style={likeAnimation}>
                        {
                            liked ? <FaHeart onClick={likeOrDislikeHandler} size={28} className='cursor-pointer text-red-500' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={26} className='cursor-pointer hover:text-gray-500 transition-colors' />
                        }
                    </div>

                    <MessageCircle onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer hover:text-gray-500 transition-colors' size={26} />
                    <Send className='cursor-pointer hover:text-gray-500 transition-colors' size={26} />
                </div>
                <Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-500 transition-colors' size={26} />
            </div>
            <div className="px-4 pb-2">
                <span className='font-semibold block mb-2 text-sm'>{postLike} likes</span>
                <p className="text-sm">
                    <span className='font-semibold mr-2'>{post.author?.username}</span>
                    {post.caption}
                </p>
                {
                    comment.length > 0 && (
                        <p onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }} className='cursor-pointer text-sm text-gray-500 mt-2 hover:text-gray-700'>View all {comment.length} comments</p>
                    )
                }
            </div>
            <div className='flex items-center justify-between px-4 py-3 border-t border-gray-100'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='outline-none text-sm w-full bg-transparent'
                />
                {
                    text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer font-semibold text-sm hover:text-blue-700 transition-colors'>Post</span>
                }

            </div>
            <CommentDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Post