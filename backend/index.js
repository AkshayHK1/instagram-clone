import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from 'mongoose';
// import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";

dotenv.config();


const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();

// Use urlencoded middleware
app.use(urlencoded({ extended: true }));

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true
}
app.use(cors(corsOptions));
app.use(express.json())
mongoose.connect(process.env.MONGO_URI);
// console.log(process.env.MONGO_URI);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);


// Only serve static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
    });
}


server.listen(PORT, () => {
    // connectDB();
    console.log(`Server listen at port ${PORT}`);
});