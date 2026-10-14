
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";

import User from "../models/User";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
} from "../validation/schemas";

const router = Router();

const createToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? ("none" as const)
      : ("lax" as const),
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /api/auth/register
router.post(
  "/register",
  validate(registerSchema),
  async (req, res): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      const normalizedName = String(name ?? "").trim();
      const normalizedEmail = String(email ?? "")
        .trim()
        .toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        res.status(409).json({
          message: "An account with this email already exists.",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(
        String(password),
        12
      );

      const user = await User.create({
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "Account created successfully.",
        user: {
          _id: String(user._id),
          id: String(user._id),
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: unknown) {
      console.error("REGISTER ERROR:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        res.status(409).json({
          message: "An account with this email already exists.",
        });
        return;
      }

      res.status(500).json({
        message: "Unable to create your account. Please try again.",
      });
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  validate(loginSchema),
  async (req, res): Promise<void> => {
    try {
      const normalizedEmail = String(req.body.email ?? "")
        .trim()
        .toLowerCase();

      const password = String(req.body.password ?? "");

      const user = await User.findOne({
        email: normalizedEmail,
      });

      if (
        !user ||
        !(await bcrypt.compare(password, user.password))
      ) {
        res.status(401).json({
          message: "Invalid email or password",
        });
        return;
      }

      const token = createToken(String(user._id));

      res.cookie("token", token, cookieOptions);

      res.status(200).json({
        message: "Login successful.",
        user: {
          _id: String(user._id),
          id: String(user._id),
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: unknown) {
      console.error("LOGIN ERROR:", error);

      res.status(500).json({
        message: "Unable to log in. Please try again.",
      });
    }
  }
);

// GET /api/auth/me
router.get("/me", async (req, res): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string"
    ) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    res.status(200).json({
      user: {
        _id: String(user._id),
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    console.error("GET CURRENT USER ERROR:", error);

    res.status(500).json({
      message: "Unable to verify your session.",
    });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? ("none" as const)
        : ("lax" as const),
    path: "/",
  });

  res.status(200).json({
    message: "Logged out successfully.",
  });
});

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  async (req, res): Promise<void> => {
    try {
      if (!process.env.SMTP_URL || !process.env.MAIL_FROM) {
        res.status(503).json({
          message:
            "Password reset email is not configured on this server",
        });
        return;
      }

      const email = String(req.body.email ?? "")
        .trim()
        .toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({
          message: "A valid email address is required",
        });
        return;
      }

      // Email delivery is not implemented here.
      // Do not report that a reset email was sent.
      res.status(503).json({
        message: "Password reset email delivery is not available",
      });
    } catch (error: unknown) {
      console.error("FORGOT PASSWORD ERROR:", error);

      res.status(500).json({
        message: "Unable to process the password reset request",
      });
    }
  }
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  async (req, res): Promise<void> => {
    try {
      const token = String(req.body.token ?? "");
      const password = String(req.body.password ?? "");

      if (
        !/^[a-f0-9]{64}$/i.test(token) ||
        password.length < 8
      ) {
        res.status(400).json({
          message:
            "This password reset link is invalid or has expired",
        });
        return;
      }

      const resetTokenHash = createHash("sha256")
        .update(token)
        .digest("hex");

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.findOneAndUpdate(
        {
          resetTokenHash,
          resetTokenExpiresAt: { $gt: new Date() },
        },
        {
          $set: { password: hashedPassword },
          $unset: {
            resetTokenHash: 1,
            resetTokenExpiresAt: 1,
          },
        },
        { new: true }
      );

      if (!user) {
        res.status(400).json({
          message:
            "This password reset link is invalid or has expired",
        });
        return;
      }

      res.status(200).json({
        message: "Password reset successful",
      });
    } catch (error: unknown) {
      console.error("RESET PASSWORD ERROR:", error);

      res.status(500).json({
        message: "Unable to reset your password",
      });
    }
  }
);

export default router;
