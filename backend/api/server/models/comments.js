import mongoose from "mongoose";
//contains schema and model for Comment and //Like
const commentSchema = new mongoose.Schema({
    post : {type:mongoose.Schema.Types.ObjectId, ref:'Post', required:true},
    user : {type: mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    text : {type:String, required: true, maxlength: 500},
    likesCount:{type:Number, default:0},
}, { timestamps: true });

const likeSchema = new mongoose.Schema({
    user:{type: mongoose.Schema.Types.ObjectId, ref: 'User',required:true},
    post:{type:mongoose.Schema.Types.ObjectId, ref:'Post',required:true},
},{ timestamps: true});

const Comment = mongoose.model('Comment', commentSchema)
export default Comment;