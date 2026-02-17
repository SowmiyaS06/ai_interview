import { Router } from "express";
import bcrypt from "bcryptjs";

import { User } from "../models/User.js";
import { createToken, getAuthCookieOptions } from "../utils/token.js";
import { requireAuth } from "../middleware/auth.js";
import { signupValidation, signinValidation } from "../middleware/validation.js";

const router = Router();

router.post("/signup", signupValidation, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = createToken({ id: user._id.toString() });
    res.cookie("auth_token", token, getAuthCookieOptions());

    return res.json({
      success: true,
      user: { id: user._id.toString(), name: user.name, email: user.email },
      message: "Account created successfully",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/signin", signinValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken({ id: user._id.toString() });
    res.cookie("auth_token", token, getAuthCookieOptions());

    return res.json({
      success: true,
      user: { id: user._id.toString(), name: user.name, email: user.email },
      message: "Signed in successfully",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/signout", (_req, res) => {
  res.clearCookie("auth_token", getAuthCookieOptions());
  res.json({ success: true, message: "Signed out successfully" });
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
