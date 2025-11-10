import express from "express";
import {registerUser, loginUser, userIDExists, verifyEmail, resendVerification} from "../auth/authentication.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/checkUserID", userIDExists);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
export default router;