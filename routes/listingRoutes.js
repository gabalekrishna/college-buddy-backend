import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import {
  createListing,
  listListings,
  getListingById,
  myListings,
} from "../controllers/listingController.js";

const router = express.Router();

// Public: list
router.get("/", listListings);

// Auth required: create and get my listings
router.post("/", authRequired, upload.single("image"), createListing);
router.get("/me", authRequired, myListings);

// Public: get by id (keep after /me to avoid conflict)
router.get("/:id", getListingById);

export default router;
