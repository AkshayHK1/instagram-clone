import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name: 'realTimeNotification',
    initialState: {
        notifications: [], // Stores all notification types
        unreadCount: 0,
    },
    reducers: {
        addNotification: (state, action) => {
            // Ensure notifications is an array
            if (!Array.isArray(state.notifications)) {
                state.notifications = [];
            }
            // Add new notification to the top
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
        markAsRead: (state) => {
            state.unreadCount = 0;
        }
    }
});
export const { addNotification, clearNotifications, markAsRead } = rtnSlice.actions;
export default rtnSlice.reducer;