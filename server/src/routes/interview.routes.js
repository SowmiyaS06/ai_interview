import { Router } from "express";

import { Interview } from "../models/Interview.js";
import { requireAuth } from "../middleware/auth.js";
import {
  interviewIdValidation,
  latestInterviewsValidation,
} from "../middleware/validation.js";

const router = Router();

router.use(requireAuth);

router.get("/user", async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    const formattedInterviews = interviews.map((int) => ({
      ...int,
      id: int._id.toString(),
      _id: undefined,
    }));

    return res.json({ success: true, interviews: formattedInterviews });
  } catch (error) {
    return next(error);
  }
});

router.get("/latest", latestInterviewsValidation, async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 20);

    const interviews = await Interview.find({
      finalized: true,
      userId: { $ne: req.user.id },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-__v")
      .lean();

    const formattedInterviews = interviews.map((int) => ({
      ...int,
      id: int._id.toString(),
      _id: undefined,
    }));

    return res.json({ success: true, interviews: formattedInterviews });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", interviewIdValidation, async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .select("-__v")
      .lean();

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const formatted = {
      ...interview,
      id: interview._id.toString(),
      _id: undefined,
    };

    return res.json({ success: true, interview: formatted });
  } catch (error) {
    return next(error);
  }
});

export default router;
