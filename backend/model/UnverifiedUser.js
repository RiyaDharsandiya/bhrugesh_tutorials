import mongoose from "mongoose";

const unverifiedUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  password: String,
  role: { type: String, default: "user" },
  standard: { type: String, required: true }, // ✅ add this line
  createdAt: { type: Date, default: Date.now, expires: 1200 }, // 20 minutes expiry
});

export default mongoose.model("UnverifiedUser", unverifiedUserSchema);
