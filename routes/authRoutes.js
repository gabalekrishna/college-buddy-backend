import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/me", authRequired, getMe);

export default router;

// collage-buddy