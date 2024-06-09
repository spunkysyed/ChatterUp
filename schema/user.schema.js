import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    profileImage:{
        type:String,
        required:true
    }
})

const UserModel=mongoose.model('Users',userSchema);
export default UserModel;