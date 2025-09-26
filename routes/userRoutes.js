import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import { listUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", authRequired, listUsers);

export default router;
