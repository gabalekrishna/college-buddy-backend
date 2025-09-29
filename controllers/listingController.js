import Listing from "../models/Listing.js";
import cloudinary from "../config/cloudinary.js";

// POST /api/listings
// multipart/form-data with optional image field "image"
export const createListing = async (req, res) => {
  try {
    const { title, author, course, description, condition, price } = req.body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "title is required" });
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum)) {
      return res.status(400).json({ message: "price must be a number" });
    }

    let imageUrl;
    let imagePublicId;
    if (req.file) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(500).json({ message: "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET" });
      }
      try {
        // Configure Cloudinary at request time to ensure env vars are loaded
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // Upload buffer to Cloudinary via upload_stream
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "college-buddy/listings", resource_type: "image" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        imageUrl = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({ message: "Image upload failed", error: uploadErr?.message || String(uploadErr) });
      }
    }

    const listing = await Listing.create({
      title,
      author,
      course,
      description,
      condition,
      price: priceNum,
      imageUrl,
      imagePublicId,
      seller: req.user._id,
    });

    res.status(201).json({ message: "Listing created", listing });
  } catch (err) {
    console.error("createListing error:", err);
    res.status(500).json({ error: err?.message || String(err) });
  }
};

// GET /api/listings
// Query: page, limit, q, minPrice, maxPrice, condition, seller, isSold
export const listListings = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const q = (req.query.q || "").trim();
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const condition = req.query.condition;
    const seller = req.query.seller;
    const isSold = req.query.isSold;

    const filter = {};
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { title: rx },
        { author: rx },
        { course: rx },
        { description: rx },
      ];
    }
    if (typeof minPrice === "number" && !Number.isNaN(minPrice)) {
      filter.price = { ...(filter.price || {}), $gte: minPrice };
    }
    if (typeof maxPrice === "number" && !Number.isNaN(maxPrice)) {
      filter.price = { ...(filter.price || {}), $lte: maxPrice };
    }
    if (condition) filter.condition = condition;
    if (seller) filter.seller = seller;
    if (isSold === "true") filter.isSold = true;
    if (isSold === "false") filter.isSold = false;

    const [items, total] = await Promise.all([
      Listing.find(filter)
        .populate("seller", "name email college year")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(filter),
    ]);

    res.json({ page, limit, total, pages: Math.ceil(total / limit), listings: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/listings/:id
export const getListingById = async (req, res) => {
  try {
    const item = await Listing.findById(req.params.id).populate("seller", "name email college year");
    if (!item) return res.status(404).json({ message: "Listing not found" });
    res.json({ listing: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/listings/me
export const myListings = async (req, res) => {
  try {
    const items = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ listings: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
