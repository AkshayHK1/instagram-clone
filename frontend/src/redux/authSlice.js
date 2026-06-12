import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        suggestedUsers: [],
        userProfile: null,
        search: [],
    },
    reducers: {
        // actions
        setAuthUser: (state, action) => {
            state.user = action.payload;
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setSearchedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        followUser: (state, action) => {
            // Update logged in user's following
            if (state.user && !state.user.following.includes(action.payload)) {
                state.user.following.push(action.payload);
            }
            // Update userProfile's followers if needed
            if (state.userProfile && state.userProfile._id === action.payload) {
                if (!state.userProfile.followers.includes(state.user._id)) {
                    state.userProfile.followers.push(state.user._id);
                }
            }
            // Update suggested users
            state.suggestedUsers = state.suggestedUsers.map(user => {
                if (user._id === action.payload) {
                    return { ...user, followers: [...(user.followers || []), state.user._id] };
                }
                return user;
            });
        },
        unfollowUser: (state, action) => {
            // Update logged in user's following
            if (state.user) {
                state.user.following = state.user.following.filter(id => id !== action.payload);
            }
            // Update userProfile's followers if needed
            if (state.userProfile && state.userProfile._id === action.payload) {
                state.userProfile.followers = state.userProfile.followers.filter(id => id !== state.user._id);
            }
            // Update suggested users
            state.suggestedUsers = state.suggestedUsers.map(user => {
                if (user._id === action.payload) {
                    return { ...user, followers: (user.followers || []).filter(id => id !== state.user._id) };
                }
                return user;
            });
        }
    }
});
export const {
    setAuthUser,
    setSuggestedUsers,
    setUserProfile,
    setSearchedUsers,
    followUser,
    unfollowUser
} = authSlice.actions;
export default authSlice.reducer;