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

// Ensure .env is loaded relative to this file, regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env"), override: true });

console.log("JWT_SECRET present:", Boolean(process.env.JWT_SECRET));
console.log("JWT_SECRET length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set. Add it to .env and restart.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Raw OpenAPI JSON
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});

app.get("/", (req, res) => {
  res.send("College Buddy API is running...");
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
