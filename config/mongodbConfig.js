import mongoose from "mongoose";

const url="<mongo db connection url>/<database name>"

export const connectToMongodb=async()=>{
    await mongoose.connect(url);
    console.log("MongoDb is Connected")
}