import User from "../models/users.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const accountInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      userID: user.userID,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profilePicUrl: user.profilePicUrl,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const profile = async(req,res) => {
    // Get user profile logic to be implemented
    try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      userID: user.userID,
      name: user.name,
      bio: user.bio,
      profilePicUrl: user.profilePicUrl,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
}

const follow = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userToFollowId = req.params.id;
    const currentUserId = req.user.id;

    // 🧩 Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userToFollowId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    if (userToFollowId === currentUserId) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }

    // 🧠 Fetch users in parallel
    const [userToFollow, currentUser] = await Promise.all([
      User.findById(userToFollowId),
      User.findById(currentUserId),
    ]);

    if (!userToFollow) {
      return res.status(404).json({ success: false, message: "User to follow not found" });
    }

    // 🔒 Email Verification Guard
    if (!currentUser.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before following other users.",
      });
    }

    // (Optional) Require target to be verified too
    if (!userToFollow.isVerified) {
      return res.status(403).json({
        success: false,
        message: "You can only follow verified users at this time.",
      });
    }

    if (currentUser.following.includes(userToFollowId)) {
      return res.status(400).json({ success: false, message: "You are already following this user" });
    }

    // ✅ Atomic updates using Mongo operators
    await Promise.all([
      User.updateOne(
        { _id: currentUserId },
        { $addToSet: { following: userToFollowId }, $inc: { followingCount: 1 } },
        { session }
      ),
      User.updateOne(
        { _id: userToFollowId },
        { $addToSet: { followers: currentUserId }, $inc: { followersCount: 1 } },
        { session }
      ),
    ]);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "You are now following this user",
      data: { currentUserId, targetUserId: userToFollowId },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error following user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};





const unfollow = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userToUnfollowId = req.params.id;
    const currentUserId = req.user.id;

    // 🧩 Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userToUnfollowId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    if (userToUnfollowId === currentUserId) {
      return res.status(400).json({ success: false, message: "You cannot unfollow yourself" });
    }

    const [userToUnfollow, currentUser] = await Promise.all([
      User.findById(userToUnfollowId),
      User.findById(currentUserId),
    ]);

    if (!userToUnfollow) {
      return res.status(404).json({ success: false, message: "User to unfollow not found" });
    }

    // 🔒 Email Verification Guard
    if (!currentUser.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before unfollowing users.",
      });
    }

    if (!currentUser.following.includes(userToUnfollowId)) {
      return res.status(400).json({ success: false, message: "You are not following this user" });
    }

    // ✅ Atomic updates using Mongo operators
    await Promise.all([
      User.updateOne(
        { _id: currentUserId },
        { $pull: { following: userToUnfollowId }, $inc: { followingCount: -1 } },
        { session }
      ),
      User.updateOne(
        { _id: userToUnfollowId },
        { $pull: { followers: currentUserId }, $inc: { followersCount: -1 } },
        { session }
      ),
    ]);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "You have unfollowed this user",
      data: { currentUserId, targetUserId: userToUnfollowId },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error unfollowing user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



export { accountInfo, follow, unfollow };
