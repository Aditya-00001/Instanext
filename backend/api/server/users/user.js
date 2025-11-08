import User from "../models/users.js";
import dotenv from "dotenv";
dotenv.config();

const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
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
export { profile };
