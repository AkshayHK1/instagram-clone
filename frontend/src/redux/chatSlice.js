import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[],
        selectedUser: null,
        unreadMessageCount: 0
    },
    reducers:{
        // actions
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setMessages:(state,action) => {
            state.messages = action.payload;
        },
        setSelectedUser:(state,action) => {
            state.selectedUser = action.payload;
            // When user selects a chat, mark all messages as read
            state.unreadMessageCount = 0;
        },
        incrementUnreadMessages:(state) => {
            state.unreadMessageCount += 1;
        },
        clearUnreadMessages:(state) => {
            state.unreadMessageCount = 0;
        }
    }
});
export const {setOnlineUsers, setMessages, setSelectedUser, incrementUnreadMessages, clearUnreadMessages} = chatSlice.actions;
export default chatSlice.reducer;