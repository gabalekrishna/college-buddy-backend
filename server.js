import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import listingRoutes from "./routes/listingRoutes.js";

// Ensure .env is loaded relative to this file, regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env"), override: true });

console.log("JWT_SECRET present:", Boolean(process.env.JWT_SECRET));
console.log("JWT_SECRET length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

console.log("Cloudinary env present:", {
  cloud_name: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  api_key: Boolean(process.env.CLOUDINARY_API_KEY),
  api_secret: Boolean(process.env.CLOUDINARY_API_SECRET),
});
console.log("Cloudinary lengths:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.length : 0,
  api_key: process.env.CLOUDINARY_API_KEY ? String(process.env.CLOUDINARY_API_KEY).length : 0,
  api_secret: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0,
});

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set. Add it to .env and restart.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Raw OpenAPI JSON
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});

app.get("/", (req, res) => {
  res.send("College Buddy API is running...");
});

// Centralized error handler (JSON), helpful for multipart/multer errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  if (err && err.message && /multipart boundary/i.test(err.message)) {
    return res.status(400).json({ message: "Malformed multipart/form-data. Remove manual Content-Type header and let your client set it." });
  }
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Max 5MB." });
  }
  return res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
