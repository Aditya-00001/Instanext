import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userid:{type: String, required: true, unique: true},
    name:{type: String, required: true},
    password:{type: String, required: true},
    email:{type: String, required: true, unique: true},
    bio:{type: String},
    profilePicUrl:{type: String},
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    avatarUrl:{type: String},
    createdAt:{type: Date, default: Date.now},
});
const User = mongoose.model("User", userSchema);
export default User;