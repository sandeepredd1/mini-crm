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

/**
 * POST /api/tasks
 * Create a task
 */
router.post(
  "/",
  requireAuth,
  validate(taskSchema),
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { customerId, dealId } = req.body;

      // Validate customer
      if (customerId) {
        if (!Types.ObjectId.isValid(customerId)) {
          res.status(400).json({
            message: "Invalid customer ID",
          });
          return;
        }

        const customer = await Customer.findOne({
          _id: customerId,
          userId: req.userId,
        });

        if (!customer) {
          res.status(404).json({
            message: "Customer not found",
          });
          return;
        }
      }

      // Validate deal
      if (dealId) {
        if (!Types.ObjectId.isValid(dealId)) {
          res.status(400).json({
            message: "Invalid deal ID",
          });
          return;
        }

        const deal = await Deal.findOne({
          _id: dealId,
          userId: req.userId,
        });

        if (!deal) {
          res.status(404).json({
            message: "Deal not found",
          });
          return;
        }
      }

      // Create task
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
    } catch {
      res.status(500).json({
        message: "Unable to create task",
      });
    }
  }
);

/**
 * GET /api/tasks
 * Get all tasks for the logged-in user
 */
router.get(
  "/",
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const tasks = await Task.find({
        userId: req.userId,
      })
        .populate("customerId", "name company email")
        .populate("dealId", "title value stage")
        .sort({ dueDate: 1 });

      res.status(200).json({
        tasks,
      });
    } catch {
      res.status(500).json({
        message: "Unable to fetch tasks",
      });
    }
  }
);

/**
 * GET /api/tasks/:id
 * Get a single task for the logged-in user
 */
router.get(
  "/:id",
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      // Validate task ID
      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({
          message: "Task not found",
        });
        return;
      }

      const task = await Task.findOne({
        _id: id,
        userId: req.userId,
      })
        .populate("customerId", "name company email")
        .populate("dealId", "title value stage");

      if (!task) {
        res.status(404).json({
          message: "Task not found",
        });
        return;
      }

      res.status(200).json({
        task,
      });
    } catch {
      res.status(500).json({
        message: "Unable to fetch task",
      });
    }
  }
);

/**
 * PUT /api/tasks/:id
 * Update a task for the logged-in user
 */
router.put(
  "/:id",
  requireAuth,
  validate(taskSchema),
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { customerId, dealId } = req.body;

      // Validate task ID
      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({
          message: "Task not found",
        });
        return;
      }

      // Validate customer
      if (customerId) {
        if (!Types.ObjectId.isValid(customerId)) {
          res.status(400).json({
            message: "Invalid customer ID",
          });
          return;
        }

        const customer = await Customer.findOne({
          _id: customerId,
          userId: req.userId,
        });

        if (!customer) {
          res.status(404).json({
            message: "Customer not found",
          });
          return;
        }
      }

      // Validate deal
      if (dealId) {
        if (!Types.ObjectId.isValid(dealId)) {
          res.status(400).json({
            message: "Invalid deal ID",
          });
          return;
        }

        const deal = await Deal.findOne({
          _id: dealId,
          userId: req.userId,
        });

        if (!deal) {
          res.status(404).json({
            message: "Deal not found",
          });
          return;
        }
      }

      // Update task
      const task = await Task.findOneAndUpdate(
        {
          _id: id,
          userId: req.userId,
        },
        {
          $set: {
            ...req.body,
            customerId: customerId
              ? new Types.ObjectId(customerId)
              : undefined,
            dealId: dealId
              ? new Types.ObjectId(dealId)
              : undefined,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("customerId", "name company email")
        .populate("dealId", "title value stage");

      if (!task) {
        res.status(404).json({
          message: "Task not found",
        });
        return;
      }

      res.status(200).json({
        message: "Task updated successfully",
        task,
      });
    } catch {
      res.status(500).json({
        message: "Unable to update task",
      });
    }
  }
);

/**
 * DELETE /api/tasks/:id
 * Delete a task for the logged-in user
 */
router.delete(
  "/:id",
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      // Validate task ID
      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({
          message: "Task not found",
        });
        return;
      }

      // Delete only if the task belongs to the logged-in user
      const task = await Task.findOneAndDelete({
        _id: id,
        userId: req.userId,
      });

      if (!task) {
        res.status(404).json({
          message: "Task not found",
        });
        return;
      }

      res.status(200).json({
        message: "Task deleted successfully",
      });
    } catch {
      res.status(500).json({
        message: "Unable to delete task",
      });
    }
  }
);

export default router;