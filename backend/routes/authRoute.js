import express from "express";
import { signup, login, verifyEmail, resetPassword, forgotPassword } from "../controller/authController.js";

const router = express.Router();

router.post('/signup', signup)
router.post('/login', login)
router.post("/verify-email", verifyEmail);
router.post("/reset-password/:token", resetPassword);
router.post("/forgot-password", forgotPassword);
export default router;
