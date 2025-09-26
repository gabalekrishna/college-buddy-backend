import User from "../models/User.js";
import { verifyJWT } from "../utils/jwt.js";

export async function authRequired(req, res, next) {
  try {
    const header = req.headers["authorization"] || "";
    const [, token] = header.split(" "); // Expecting: Bearer <token>
    if (!token) return res.status(401).json({ message: "Missing token" });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not set");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const payload = verifyJWT(token, secret);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Invalid token user" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
