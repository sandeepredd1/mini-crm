
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

  return jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production"
    ? ("none" as const)
    : ("lax" as const),
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /api/auth/register
router.post(
  "/register",
  validate(registerSchema),
  async (req, res) => {
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
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const normalizedEmail = String(email ?? "")
        .trim()
        .toLowerCase();

      const user = await User.findOne({
        email: normalizedEmail,
      });

      if (
        !user ||
        !(await bcrypt.compare(
          String(password),
          user.password
        ))
      ) {
        res.status(401).json({
          message: "Invalid email or password.",
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
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        message: "Not authenticated.",
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
        message: "Invalid authentication token.",
      });
      return;
    }

    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user) {
      res.status(401).json({
        message: "User not found.",
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
        message: "Session expired. Please log in again.",
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
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production"
      ? ("none" as const)
      : ("lax" as const),
    path: "/",
  });

  res.status(200).json({
    message: "Logged out successfully.",
  });
});

export default router;
