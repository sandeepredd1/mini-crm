
import { Router, Response } from "express";
import { Types } from "mongoose";

import Task from "../models/Task";
import Customer from "../models/Customer";
import Deal from "../models/Deal";
import {
  AuthenticatedRequest,
  requireAuth,
} from "../middleware/auth";
import { validate } from "../middleware/validate";
import { taskSchema } from "../validation/schemas";

const router = Router();

const VALID_STATUSES = [
  "today",
  "upcoming",
  "overdue",
  "completed",
];

/**
 * POST /api/tasks
 * Create a task
 */
router.post(
  "/",
  requireAuth,
  validate(taskSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { customerId, dealId } = req.body;

      if (customerId) {
        if (
          typeof customerId !== "string" ||
          !Types.ObjectId.isValid(customerId)
        ) {
          res.status(400).json({ message: "Invalid customer ID" });
          return;
        }

        const customer = await Customer.findOne({
          _id: customerId,
          userId: req.userId,
        });

        if (!customer) {
          res.status(404).json({ message: "Customer not found" });
          return;
        }
      }

      if (dealId) {
        if (
          typeof dealId !== "string" ||
          !Types.ObjectId.isValid(dealId)
        ) {
          res.status(400).json({ message: "Invalid deal ID" });
          return;
        }

        const deal = await Deal.findOne({
          _id: dealId,
          userId: req.userId,
        });

        if (!deal) {
          res.status(404).json({ message: "Deal not found" });
          return;
        }
      }

      const task = await Task.create({
        ...req.body,
        userId: new Types.ObjectId(req.userId),
        customerId: customerId
          ? new Types.ObjectId(customerId)
          : undefined,
        dealId: dealId
          ? new Types.ObjectId(dealId)
          : undefined,
      });

      res.status(201).json({
        message: "Task created successfully",
        task,
      });
    } catch (error) {
      console.error("CREATE TASK ERROR:", error);
      res.status(500).json({ message: "Unable to create task" });
    }
  }
);

/**
 * GET /api/tasks
 * Get tasks for the logged-in user
 * Optional filters: status, customerId, dealId
 */
router.get(
  "/",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const status =
        typeof req.query.status === "string" ? req.query.status : "";

      const customerId =
        typeof req.query.customerId === "string"
          ? req.query.customerId
          : "";

      const dealId =
        typeof req.query.dealId === "string"
          ? req.query.dealId
          : "";

      if (status && !VALID_STATUSES.includes(status)) {
        res.status(400).json({ message: "Invalid task status filter" });
        return;
      }

      if (customerId && !Types.ObjectId.isValid(customerId)) {
        res.status(400).json({ message: "Invalid customer ID" });
        return;
      }

      if (dealId && !Types.ObjectId.isValid(dealId)) {
        res.status(400).json({ message: "Invalid deal ID" });
        return;
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const query: Record<string, unknown> = {
        userId: req.userId,
      };

      if (customerId) query.customerId = customerId;
      if (dealId) query.dealId = dealId;

      if (status === "completed") {
        query.completed = true;
      } else if (status === "overdue") {
        query.completed = false;
        query.dueDate = { $lt: startOfToday };
      } else if (status === "today") {
        query.completed = false;
        query.dueDate = {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        };
      } else if (status === "upcoming") {
        query.completed = false;
        query.dueDate = { $gte: startOfTomorrow };
      }

      const tasks = await Task.find(query)
        .populate("customerId", "name company email")
        .populate("dealId", "title value stage")
        .sort({ dueDate: 1 });

      res.status(200).json({ tasks });
    } catch (error) {
      console.error("FETCH TASKS ERROR:", error);
      res.status(500).json({ message: "Unable to fetch tasks" });
    }
  }
);

/**
 * GET /api/tasks/:id
 * Get one task belonging to the logged-in user
 */
router.get(
  "/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id =
        typeof req.params.id === "string" ? req.params.id : "";

      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      const task = await Task.findOne({
        _id: id,
        userId: req.userId,
      })
        .populate("customerId", "name company email")
        .populate("dealId", "title value stage");

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      res.status(200).json({ task });
    } catch (error) {
      console.error("FETCH TASK ERROR:", error);
      res.status(500).json({ message: "Unable to fetch task" });
    }
  }
);

/**
 * PUT /api/tasks/:id
 * Update a task
 */
router.put(
  "/:id",
  requireAuth,
  validate(taskSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id =
        typeof req.params.id === "string" ? req.params.id : "";

      const { customerId, dealId } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (customerId) {
        if (
          typeof customerId !== "string" ||
          !Types.ObjectId.isValid(customerId)
        ) {
          res.status(400).json({ message: "Invalid customer ID" });
          return;
        }

        const customer = await Customer.findOne({
          _id: customerId,
          userId: req.userId,
        });

        if (!customer) {
          res.status(404).json({ message: "Customer not found" });
          return;
        }
      }

      if (dealId) {
        if (
          typeof dealId !== "string" ||
          !Types.ObjectId.isValid(dealId)
        ) {
          res.status(400).json({ message: "Invalid deal ID" });
          return;
        }

        const deal = await Deal.findOne({
          _id: dealId,
          userId: req.userId,
        });

        if (!deal) {
          res.status(404).json({ message: "Deal not found" });
          return;
        }
      }

      const updateFields: Record<string, unknown> = {
        ...req.body,
      };

      delete updateFields.customerId;
      delete updateFields.dealId;

      if (customerId) {
        updateFields.customerId = new Types.ObjectId(customerId);
      }

      if (dealId) {
        updateFields.dealId = new Types.ObjectId(dealId);
      }

      const unsetFields: Record<string, 1> = {};

      if (!customerId) unsetFields.customerId = 1;
      if (!dealId) unsetFields.dealId = 1;

      const task = await Task.findOneAndUpdate(
        {
          _id: id,
          userId: req.userId,
        },
        {
          $set: updateFields,
          ...(Object.keys(unsetFields).length > 0
            ? { $unset: unsetFields }
            : {}),
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("customerId", "name company email")
        .populate("dealId", "title value stage");

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      res.status(200).json({
        message: "Task updated successfully",
        task,
      });
    } catch (error) {
      console.error("UPDATE TASK ERROR:", error);
      res.status(500).json({ message: "Unable to update task" });
    }
  }
);

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete(
  "/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id =
        typeof req.params.id === "string" ? req.params.id : "";

      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      const task = await Task.findOneAndDelete({
        _id: id,
        userId: req.userId,
      });

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      res.status(200).json({
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);
      res.status(500).json({ message: "Unable to delete task" });
    }
  }
);

export default router;
