import { Router, Response } from "express";
import { Types } from "mongoose";

import Customer from "../models/Customer";
import Deal from "../models/Deal";
import Task from "../models/Task";
import {
  AuthenticatedRequest,
  requireAuth,
} from "../middleware/auth";

const router = Router();

/**
 * GET /api/dashboard
 * Get dashboard statistics for the logged-in user
 */
router.get(
  "/",
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = new Types.ObjectId(req.userId);

      // Date boundaries
      const now = new Date();

      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      // Run dashboard queries in parallel
      const [
        totalCustomers,
        openPipelineResult,
        dealsWonThisMonth,
        tasksDueToday,
        overdueTasks,
        pipelineByStage,
      ] = await Promise.all([
        // Total customers
        Customer.countDocuments({
          userId,
        }),

        // Open pipeline value
        Deal.aggregate([
          {
            $match: {
              userId,
              stage: {
                $nin: ["Won", "Lost"],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$value",
              },
            },
          },
        ]),

        // Deals won this month
        Deal.countDocuments({
          userId,
          stage: "Won",
          updatedAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        }),

        // Tasks due today
        Task.countDocuments({
          userId,
          completed: false,
          dueDate: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
        }),

        // Overdue tasks
        Task.countDocuments({
          userId,
          completed: false,
          dueDate: {
            $lt: startOfToday,
          },
        }),

        // Pipeline value by stage
        Deal.aggregate([
          {
            $match: {
              userId,
            },
          },
          {
            $group: {
              _id: "$stage",
              value: {
                $sum: "$value",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              value: -1,
            },
          },
        ]),
      ]);

      const openPipelineValue =
        openPipelineResult.length > 0
          ? openPipelineResult[0].total
          : 0;

      const pipeline = pipelineByStage.map((item) => ({
        stage: item._id,
        value: item.value,
        count: item.count,
      }));

      res.status(200).json({
        summary: {
          totalCustomers,
          openPipelineValue,
          dealsWonThisMonth,
          tasksDueToday,
          overdueTasks,
        },
        pipeline,
      });
    } catch {
      res.status(500).json({
        message: "Unable to fetch dashboard data",
      });
    }
  }
);

export default router;