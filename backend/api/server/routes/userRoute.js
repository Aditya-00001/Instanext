import express from "express";
import { accountInfo, follow, unfollow } from "../users/user.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/me", authMiddleware, accountInfo);
router.post("/:id/follow", authMiddleware, follow);
router.post("/:id/unfollow", authMiddleware, unfollow);
export default router;