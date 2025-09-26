import User from "../models/User.js";

// GET /api/users
// Query params: page=1&limit=20&q=search&verified=true|false
export const listUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;
    const q = (req.query.q || "").trim();
    const verified = req.query.verified;

    const filter = {};
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { name: rx },
        { email: rx },
        { college: rx },
        { year: rx },
      ];
    }
    if (verified === "true") filter.isVerified = true;
    if (verified === "false") filter.isVerified = false;

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      users: items,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
