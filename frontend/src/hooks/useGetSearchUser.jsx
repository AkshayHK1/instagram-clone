import { setSearchedUsers } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";


const useGetSearchUser = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchSearchedUsers = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/user/search/${user._id}`, { withCredentials: true });
                if (res.data.success) { 
                    dispatch(setSearchedUsers(res.data.users));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSearchedUsers();
    }, [1]);
};
export default useGetSearchUser;