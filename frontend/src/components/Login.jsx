import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const loginHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8000/api/v1/user/login', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(user){
            navigate("/");
        }
    }, [user, navigate])
    return (
        <div className='flex items-center w-screen h-screen justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
            <div className="w-full max-w-md">
                <form onSubmit={loginHandler} className='bg-white shadow-xl rounded-2xl flex flex-col gap-6 p-10 border border-gray-200'>
                    <div className='mb-2'>
                        <h1 className='text-center font-extrabold text-4xl mb-2'>Instagram Clone</h1>
                        <p className='text-sm text-center text-gray-500'>Sign in to see photos and videos from your friends</p>
                    </div>
                    <div className="space-y-1">
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={input.email}
                            onChange={changeEventHandler}
                            className="h-12 bg-gray-50 border-gray-300 focus:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400"
                        />
                    </div>
                    <div className="space-y-1">
                        <Input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={input.password}
                            onChange={changeEventHandler}
                            className="h-12 bg-gray-50 border-gray-300 focus:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400"
                        />
                    </div>
                    {
                        loading ? (
                            <Button className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled>
                                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                Logging in...
                            </Button>
                        ) : (
                            <Button type='submit' className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                Log in
                            </Button>
                        )
                    }

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">or</span>
                        </div>
                    </div>

                    <p className='text-center text-sm text-gray-600'>
                        Don't have an account? <Link to="/signup" className='font-semibold text-blue-600 hover:text-blue-700'>Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login