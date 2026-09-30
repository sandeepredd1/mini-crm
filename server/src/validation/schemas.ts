import { z } from "zod";
import { Types } from "mongoose";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  company: z
    .string()
    .trim()
    .min(1, "Company is required")
    .max(150, "Company must not exceed 150 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(30, "Phone number must not exceed 30 characters"),

  status: z.enum(["active", "inactive", "lead"], {
    message: "Status must be active, inactive, or lead",
  }),

  notes: z
    .string()
    .trim()
    .max(2000, "Notes must not exceed 2000 characters")
    .optional()
    .default(""),
});

export const dealSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title must not exceed 150 characters"),

  value: z
    .number()
    .positive("Value must be greater than 0"),

  stage: z.enum(
    ["Lead", "Qualified", "Proposal", "Won", "Lost"],
    {
      message:
        "Stage must be Lead, Qualified, Proposal, Won, or Lost",
    }
  ),

  expectedCloseDate: z
    .string()
    .datetime({
      message: "Expected close date must be a valid date",
    }),

  customerId: z
    .string()
    .refine(
      (value) => Types.ObjectId.isValid(value),
      "Invalid customer ID"
    ),
});

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title must not exceed 150 characters"),

  dueDate: z
    .string()
    .datetime({
      message: "Due date must be a valid date",
    }),

  priority: z.enum(
    ["Low", "Medium", "High"],
    {
      message: "Priority must be Low, Medium, or High",
    }
  ),

  completed: z
    .boolean()
    .default(false),

  customerId: z
    .string()
    .refine(
      (value) => Types.ObjectId.isValid(value),
      "Invalid customer ID"
    )
    .optional(),

  dealId: z
    .string()
    .refine(
      (value) => Types.ObjectId.isValid(value),
      "Invalid deal ID"
    )
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type TaskInput = z.infer<typeof taskSchema>;