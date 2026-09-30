import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

import User from "../models/User";
import { loginSchema, registerSchema } from "../validation/schemas";
import { validate } from "../middleware/validate";
import {
  AuthenticatedRequest,
  requireAuth,
} from "../middleware/auth";

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

/**
 * POST /api/auth/register
 */
router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        res.status(409).json({
          message: "An account with this email already exists",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch {
      res.status(500).json({
        message: "Unable to register user",
      });
    }
  }
);

/**
 * POST /api/auth/login
 */
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        res.status(401).json({
          message: "Invalid email or password",
        });
        return;
      }

      const passwordMatches = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatches) {
        res.status(401).json({
          message: "Invalid email or password",
        });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        res.status(500).json({
          message: "Server authentication configuration is missing",
        });
        return;
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
        },
        jwtSecret,
        {
          expiresIn: "7d",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
          process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch {
      res.status(500).json({
        message: "Unable to login",
      });
    }
  }
);

/**
 * GET /api/auth/me
 */
router.get(
  "/me",
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const user = await User.findById(req.userId).select("-password");

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch {
      res.status(500).json({
        message: "Unable to restore session",
      });
    }
  }
);

/**
 * POST /api/auth/logout
 */
router.post(
  "/logout",
  requireAuth,
  (_req: AuthenticatedRequest, res: Response): void => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  }
);

export default router;