import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalScore: { type: Number, required: true },
  categoryScores: [{
    name: { type: String, required: true },
    score: { type: Number, required: true },
    comment: { type: String, required: true },
  }],
  strengths: [{ type: String, required: true }],
  areasForImprovement: [{ type: String, required: true }],
  finalAssessment: { type: String, required: true },
  createdAt: { type: String, required: true },
});

// Indexes for performance
feedbackSchema.index({ interviewId: 1, userId: 1 });
feedbackSchema.index({ userId: 1, createdAt: -1 });

export const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
