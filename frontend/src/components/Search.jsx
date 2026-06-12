import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Debounce function to limit API calls
    const debounce = (func, delay) => {
        let timeoutId;
        const debouncedFunc = (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
        debouncedFunc.cancel = () => {
            clearTimeout(timeoutId);
        };
        return debouncedFunc;
    };

    const handleSearch = async (query) => {
        setLoading(true);
        try {
            let url = "http://localhost:8000/api/v1/user/search";
            if (query && query.trim()) {
                url += `/${encodeURIComponent(query)}`;
            }
            const response = await axios.get(url, { withCredentials: true });
            if (response.data.success) {
                setSearchResults(response.data.users);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Search error:", error);
            toast.error(error.response?.data?.message || "An error occurred while searching.");
        }
    }

    // Create debounced version of handleSearch
    const debouncedSearch = debounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch(searchQuery);
        // Cleanup function to clear timeout
        return () => {
            debouncedSearch.cancel?.();
        };
    }, [searchQuery]);

    return (
        <div className="flex justify-center items-start h-screen">
            <div className="search-container text-center mt-10">
                <input
                    type="text"
                    placeholder="Search users by username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded p-2 mb-4 w-64"
                />

                {loading && <p className="text-gray-500 mb-4">Searching...</p>}

                {!loading && searchResults.length > 0 && (
                    <div className="search-results">
                        <h2 className="font-bold mb-4">Search Results:</h2>
                        <div className="flex flex-col gap-4 items-center">
                            {searchResults.map((user) => (
                                <div key={user._id} className='flex items-center gap-2'>
                                    <Link to={`/profile/${user?._id}`}>
                                        <Avatar>
                                            <AvatarImage src={user?.profilePicture} alt="post_image" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="text-left">
                                        <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                                        <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
