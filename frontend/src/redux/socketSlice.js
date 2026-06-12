import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
    name: "socketio",
    initialState: {
        socketId: null,
        isConnected: false,
    },
    reducers: {
        // actions
        setSocketState: (state, action) => {
            state.socketId = action.payload.socketId; // Store only the socket ID
            state.isConnected = action.payload.isConnected; // Store connection status
        },
    },
});

export const { setSocketState } = socketSlice.actions; // Change to setSocketState
export default socketSlice.reducer;