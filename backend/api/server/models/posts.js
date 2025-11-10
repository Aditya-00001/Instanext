import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    mediaUrl : {type: String, required: true},
    thumbnailUrl: {type:String},
    mediaType: {type: String, enum: ['image', 'video'], required: true},
    hashtags :[{type:String}],
    caption : {type: String, maxlength:500},
    likesCount : {type: Number, default: 0},
    likedBy : [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    commentsCount : {type: Number, default: 0},
    createdAt : {type: Date, default: Date.now},
    updatedAt: {type:Date, default:Date.now}
}, { timestamps: true });

const Post = mongoose.model("Post",postSchema);
export default Post;
// export default Post;