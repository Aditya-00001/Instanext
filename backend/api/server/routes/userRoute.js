import express from "express";
import {profile} from "../users/user.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/me", authMiddleware, profile);
export default router;