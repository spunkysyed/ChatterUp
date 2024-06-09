import mongoose from "mongoose";

const chatSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    profileImage:{
        type:String,
        required:true
    },
    createdOn:{
        type:Date,
        default:Date.now
    }
})

const ChatModel=mongoose.model('Chats',chatSchema);
export default ChatModel;