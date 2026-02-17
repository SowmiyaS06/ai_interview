import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ email: 1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
