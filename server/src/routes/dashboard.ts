
import { Router, type Response } from "express";
import { Types } from "mongoose";

import Customer from "../models/Customer";
import Deal from "../models/Deal";
import Task from "../models/Task";
import {
  type AuthenticatedRequest,
  requireAuth,
} from "../middleware/auth";

const router = Router();

/**
 * GET /api/dashboard
 * Dashboard statistics for the logged-in user.
 */
router.get(
  "/",
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.userId || !Types.ObjectId.isValid(req.userId)) {
  res.status(401).json({
    message: "Invalid authentication user",
  });
  return;
}

      const userId = new Types.ObjectId(req.userId);
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

      const [
        customerResult,
        openPipelineResult,
        dealsWonResult,
        tasksDueTodayResult,
        overdueTasksResult,
        pipelineByStage,
      ] = await Promise.all([
        Customer.aggregate([
          { $match: { userId } },
          { $count: "total" },
        ]),

        Deal.aggregate([
          {
            $match: {
              userId,
              stage: { $nin: ["Won", "Lost"] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$value" },
            },
          },
        ]),

        Deal.aggregate([
          {
            $match: {
              userId,
              stage: "Won",
              updatedAt: {
                $gte: startOfMonth,
                $lte: endOfMonth,
              },
            },
          },
          { $count: "total" },
        ]),

        Task.aggregate([
          {
            $match: {
              userId,
              completed: false,
              dueDate: {
                $gte: startOfToday,
                $lte: endOfToday,
              },
            },
          },
          { $count: "total" },
        ]),

        Task.aggregate([
          {
            $match: {
              userId,
              completed: false,
              dueDate: { $lt: startOfToday },
            },
          },
          { $count: "total" },
        ]),

        Deal.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: "$stage",
              value: { $sum: "$value" },
              count: { $sum: 1 },
            },
          },
          { $sort: { value: -1 } },
        ]),
      ]);

      const totalCustomers = customerResult[0]?.total ?? 0;
      const openPipelineValue =
        openPipelineResult[0]?.total ?? 0;
      const dealsWonThisMonth =
        dealsWonResult[0]?.total ?? 0;
      const tasksDueToday =
        tasksDueTodayResult[0]?.total ?? 0;
      const overdueTasks =
        overdueTasksResult[0]?.total ?? 0;

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
    } catch (error) {
      console.error("Dashboard error:", error);

      res.status(500).json({
        message: "Unable to fetch dashboard data",
      });
    }
  }
);

export default router;
