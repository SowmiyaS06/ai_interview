import { Router } from "express";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { Interview } from "../models/Interview.js";
import { getRandomInterviewCover } from "../utils/covers.js";
import { generateQuestionsValidation } from "../middleware/validation.js";

const router = Router();

router.post("/generate", generateQuestionsValidation, async (req, res, next) => {
  try {
    const { type, role, level, techstack, amount, userid } = req.body;

    const normalizeType = (value) => {
      const normalized = String(value || "").trim().toLowerCase();
      return (
        {
          technical: "Technical",
          behavioral: "Behavioral",
          mixed: "Mixed",
        }[normalized] || value
      );
    };

    const normalizeLevel = (value) => {
      const normalized = String(value || "").trim().toLowerCase();
      return (
        {
          junior: "Junior",
          mid: "Mid",
          senior: "Senior",
          lead: "Lead",
          principal: "Principal",
        }[normalized] || value
      );
    };

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${normalizeLevel(level)}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${normalizeType(type)}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const parsedTechstack = Array.isArray(techstack)
      ? techstack
      : String(techstack)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    const cleanedQuestions = String(questions)
      .trim()
      .replace(/^```(json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    const bracketStart = cleanedQuestions.indexOf("[");
    const bracketEnd = cleanedQuestions.lastIndexOf("]");
    const jsonSlice =
      bracketStart >= 0 && bracketEnd > bracketStart
        ? cleanedQuestions.slice(bracketStart, bracketEnd + 1)
        : cleanedQuestions;

    const parsedQuestions = JSON.parse(jsonSlice);

    const interview = await Interview.create({
      role,
      type: normalizeType(type),
      level: normalizeLevel(level),
      techstack: parsedTechstack,
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    });

    return res.json({ success: true, interviewId: interview._id.toString() });
  } catch (error) {
    console.error("Question generation error:", error);
    return next(error);
  }
});

export default router;
