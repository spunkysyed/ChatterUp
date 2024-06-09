import express from 'express';
import cors from 'cors';
import http from 'http'
import {Server} from 'socket.io'

import { connectToMongodb } from './config/mongodbConfig.js';

import UserModel from './schema/user.schema.js';
import ChatModel from './schema/chat.schema.js';

const app=express()

// creating the server
const server=new http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:'*',
        methods:['GET','POST']
    }
});

// list of profile images

const profileImages = [
    "/images/batman.png",
    "/images/spiderman.png",
    "/images/deadpool.png",
    "/images/dinasoaurMan.png",
    "/images/koala.png",
    "/images/ninja.png"
];

// gives random images to every new use
const getRandomProfileImage = () => {
    return profileImages[Math.floor(Math.random() * profileImages.length)];
};

io.on('connection',(socket)=>{
    console.log("Connection is Established");
    
    // New User Joins the room
    socket.on('join', async (data) => {
        try {
            socket.userName = data;
            const user = await UserModel.findOne({ name: data });
            if (!user) {
                const profileImage = getRandomProfileImage();
                const newUser = new UserModel({ name: data ,profileImage});
                await newUser.save();
                io.emit('newUser',data);
            }
            const users = await UserModel.find({});
            const chats = await ChatModel.find({});

            socket.emit('load', { users, chats });
            io.emit('newUserAdded', users);
        } catch (error) {
            console.error('Error handling join event:', error);
        }
    });

    // New Message is been added in datatbase
    
    socket.on('message', async (data) => {
        try {
            const {name,message}=data;
            const user=await UserModel.findOne({name});

            const newChat = new ChatModel({
                name,
                message,
                profileImage:user.profileImage
            });
            await newChat.save();
           
            const users = await UserModel.find({});
            const chats = await ChatModel.find({});
            // Broadcast the message to all users
            socket.broadcast.emit('newMessage', newChat);
            socket.emit('load',{users,chats})
        } catch (error) {
            console.error('Error handling message event:', error);
        }
    });
    
    // shows the typing in the notification
    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });
    
// when typing stops typing get deleted
    socket.on('stopTyping', (username) => {
        socket.broadcast.emit('stopTyping', username);
    });

    // disconnects the server and deletes the user from the datatbase

    socket.on('disconnect',async()=>{
        await UserModel.findOneAndDelete({name:socket.userName})
        const users = await UserModel.find({});
        socket.broadcast.emit('userDisconnected', users);
        console.log("Connection is Disconnected");
    })
});




server.listen(4000,()=>{
    console.log("Backend is running at port 4000");
    connectToMongodb();
})