import { Conversation } from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

// for chatting
export const sendMessage = async(req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { textMessage: message } = req.body;

        // Check message is blank or not
        if (!message || message.trim() === "") {
            return res.status(400).json({ success: false, message: "Message field is required." });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // start conversation
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });

        if (newMessage) conversation.messages.push(newMessage._id);

        //save vatchit
        await Promise.all([conversation.save(), newMessage.save()]);

        // Fetch sender details for notification
        const sender = await User.findById(senderId).select('username profilePicture');

        //socket io :- send and receive message
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        return res.status(201).json({
            success: true,
            newMessage
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Failed to send message" });
    }
};
//pelana message leva mate
export const getMessage = async(req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('messages');

        if (!conversation) return res.status(200).json({ success: true, messages: [] });

        return res.status(200).json({ success: true, messages: conversation.messages });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
};