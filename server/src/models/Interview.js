import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  role: { type: String, required: true },
  type: { type: String, required: true },
  level: { type: String, required: true },
  techstack: [{ type: String, required: true }],
  questions: [{ type: String, required: true }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  finalized: { type: Boolean, default: true },
  coverImage: { type: String },
  createdAt: { type: String, required: true },
});

// Indexes for performance
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ finalized: 1, createdAt: -1 });

export const Interview =
  mongoose.models.Interview || mongoose.model("Interview", interviewSchema);
