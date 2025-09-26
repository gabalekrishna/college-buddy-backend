import mongoose from "mongoose";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /[^@\s]+@[^@\s]+\.[^@\s]+/,
    },
    password: { type: String, required: true, minlength: 6 },
    college: { type: String, trim: true },
    year: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Helper to determine if password is already hashed in our format
function isHashed(pw) {
  return typeof pw === "string" && pw.startsWith("s:");
}

// Pre-save hook to hash password if modified
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  const pwd = this.password;
  if (isHashed(pwd)) return next();

  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pwd, salt, 64).toString("hex");
  this.password = `s:${salt}:${hash}`;
  next();
});

// Instance method to compare a plaintext password against stored hash
userSchema.methods.comparePassword = function (candidatePassword) {
  try {
    const stored = this.password || "";
    if (!isHashed(stored)) {
      // Legacy plain-text password fallback (should not happen after migration)
      return Promise.resolve(stored === candidatePassword);
    }
    const [, salt, storedHash] = stored.split(":");
    const derived = scryptSync(candidatePassword, salt, 64);
    const storedBuf = Buffer.from(storedHash, "hex");
    // Use constant-time compare
    const ok =
      storedBuf.length === derived.length &&
      timingSafeEqual(storedBuf, Buffer.from(derived));
    return Promise.resolve(ok);
  } catch (e) {
    return Promise.resolve(false);
  }
};

export default mongoose.model("User", userSchema);
