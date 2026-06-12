import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { clearNotifications, markAsRead } from '@/redux/rtnSlice'
import { setSelectedUser } from '@/redux/chatSlice'

const LeftSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector(store => store.auth);
    const { notifications, unreadCount } = useSelector(store => store.realTimeNotification);
    const { unreadMessageCount } = useSelector(store => store.chat);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    const isActive = (text) => {
        if (text === 'Home') return location.pathname === '/';
        if (text === 'Search') return location.pathname === '/Search';
        if (text === 'Explore') return location.pathname === '/explore';
        if (text === 'Messages') return location.pathname === '/chat';
        if (text === 'Notifications') return location.pathname === '/notifications';
        if (text === 'Profile') return location.pathname === `/profile/${user?._id}`;
        return false;
    }

    const logoutHandler = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/user/logout', { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
            dispatch(setSelectedUser(null));
        } else if (textType === 'Search') {
            navigate("/Search");
        } else if (textType === 'Explore') {
            navigate("/explore");
        } else if (textType === 'Notifications') {
            navigate("/notifications");
            dispatch(markAsRead());
        }
    }

    const sidebarItems = [
        { icon: <Home className="w-6 h-6" />, text: "Home" },
        { icon: <Search className="w-6 h-6" />, text: "Search" },
        { icon: <TrendingUp className="w-6 h-6" />, text: "Explore" },
        { icon: <MessageCircle className="w-6 h-6" />, text: "Messages" },
        { icon: <Heart className="w-6 h-6" />, text: "Notifications" },
        { icon: <PlusSquare className="w-6 h-6" />, text: "Create" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt={user?.username} />
                    <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "CN"}</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut className="w-6 h-6" />, text: "Logout" },
    ]
    return (
        <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-200 w-64 h-screen bg-white'>
            <div className='flex flex-col h-full justify-between py-6'>
                <div>
                    <h1 className='mb-8 pl-4 font-bold text-2xl tracking-tight'>Instagram Clone</h1>
                    <nav className='space-y-2'>
                        {
                            sidebarItems.map((item, index) => (
                                <div 
                                    onClick={() => sidebarHandler(item.text)} 
                                    key={index} 
                                    className={`flex items-center gap-4 relative hover:bg-gray-100 cursor-pointer rounded-xl p-3 transition-all duration-200 ${isActive(item.text) ? 'font-bold bg-gray-50' : ''}`}
                                >
                                    <div className={`${isActive(item.text) ? 'scale-110' : ''} transition-transform duration-200`}>
                                        {item.icon}
                                    </div>
                                    <span className={`${isActive(item.text) ? 'font-bold' : ''}`}>{item.text}</span>
                                    {
                                        item.text === "Notifications" && unreadCount > 0 && (
                                            <div className="absolute -top-1 right-2 rounded-full bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </div>
                                        )
                                    }
                                    {
                                        item.text === "Messages" && unreadMessageCount > 0 && (
                                            <div className="absolute -top-1 right-2 rounded-full bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                                                {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                            </div>
                                        )
                                    }
                                </div>
                            ))
                        }
                    </nav>
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />
        </div>
    )
}

export default LeftSidebar