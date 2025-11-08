import express from "express";
import {registerUser, loginUser, userIDExists} from "../auth/authentication.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/checkUserID", userIDExists);
export default router;