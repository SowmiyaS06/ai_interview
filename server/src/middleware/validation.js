import { body, param, query, validationResult } from "express-validator";

// Validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validations
export const signupValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validate,
];

export const signinValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

// Interview validations
export const interviewIdValidation = [
  param("id").isMongoId().withMessage("Invalid interview ID"),
  validate,
];

export const latestInterviewsValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validate,
];

// Feedback validations
export const createFeedbackValidation = [
  body("interviewId").isMongoId().withMessage("Invalid interview ID"),
  body("transcript")
    .isArray({ min: 1 })
    .withMessage("Transcript must be a non-empty array"),
  body("transcript.*.role")
    .isIn(["user", "assistant", "system"])
    .withMessage("Invalid role in transcript"),
  body("transcript.*.content")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),
  body("feedbackId")
    .optional()
    .isMongoId()
    .withMessage("Invalid feedback ID"),
  validate,
];

// VAPI validations
export const generateQuestionsValidation = [
  body("type")
    .custom((value) => {
      if (!value) return false;
      const normalized = String(value).trim().toLowerCase();
      return ["technical", "behavioral", "mixed"].includes(normalized);
    })
    .withMessage("Type must be Technical, Behavioral, or Mixed"),
  body("role")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Role must be between 2 and 100 characters"),
  body("level")
    .custom((value) => {
      if (!value) return false;
      const normalized = String(value).trim().toLowerCase();
      return ["junior", "mid", "senior", "lead", "principal"].includes(normalized);
    })
    .withMessage("Invalid experience level"),
  body("techstack")
    .custom((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim().length > 0;
      return false;
    })
    .withMessage("Tech stack is required"),
  body("amount")
    .isInt({ min: 1, max: 20 })
    .withMessage("Amount must be between 1 and 20"),
  body("userid").isMongoId().withMessage("Invalid user ID"),
  validate,
];
