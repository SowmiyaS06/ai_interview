import { Router } from "express";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { Feedback } from "../models/Feedback.js";
import { requireAuth } from "../middleware/auth.js";
import { feedbackSchema } from "../schemas/feedbackSchema.js";
import {
  interviewIdValidation,
  createFeedbackValidation,
} from "../middleware/validation.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/by-interview/:id",
  interviewIdValidation,
  async (req, res, next) => {
    try {
      const feedback = await Feedback.findOne({
        interviewId: req.params.id,
        userId: req.user.id,
      })
        .select("-__v")
        .lean();

      if (!feedback) {
        return res.json({ success: true, feedback: null });
      }

      const formatted = {
        ...feedback,
        id: feedback._id.toString(),
        _id: undefined,
      };

      return res.json({ success: true, feedback: formatted });
    } catch (error) {
      return next(error);
    }
  }
);

router.post("/", createFeedbackValidation, async (req, res, next) => {
  try {
    const { interviewId, transcript, feedbackId } = req.body;

    const formattedTranscript = transcript
      .map((sentence) => `- ${sentence.role}: ${sentence.content}\n`)
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", { structuredOutputs: false }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedbackPayload = {
      interviewId,
      userId: req.user.id,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedback;
    if (feedbackId) {
      feedback = await Feedback.findByIdAndUpdate(
        feedbackId,
        feedbackPayload,
        { new: true, runValidators: true }
      );
      if (!feedback) {
        return res.status(404).json({ success: false, message: "Feedback not found" });
      }
    } else {
      feedback = await Feedback.create(feedbackPayload);
    }

    return res.json({ success: true, feedbackId: feedback._id.toString() });
  } catch (error) {
    console.error("Feedback generation error:", error);
    return next(error);
  }
});

export default router;
