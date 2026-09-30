import { Router, Response } from "express";
import { Types } from "mongoose";

import Deal from "../models/Deal";
import Customer from "../models/Customer";
import {
  AuthenticatedRequest,
  requireAuth,
} from "../middleware/auth";
import { validate } from "../middleware/validate";
import { dealSchema } from "../validation/schemas";

const router = Router();

/**
 * POST /api/deals
 * Create a deal
 */
router.post(
  "/",
  requireAuth,
  validate(dealSchema),
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { customerId } = req.body;

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

      const deal = await Deal.create({
        ...req.body,
        userId: new Types.ObjectId(req.userId),
        customerId: new Types.ObjectId(customerId),
      });

      res.status(201).json({
        message: "Deal created successfully",
        deal,
      });
    } catch {
      res.status(500).json({
        message: "Unable to create deal",
      });
    }
  }
);

/**
 * GET /api/deals
 * Get all deals for the logged-in user
 */
router.get(
  "/",
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const deals = await Deal.find({
        userId: req.userId,
      })
        .populate("customerId", "name company email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        deals,
      });
    } catch {
      res.status(500).json({
        message: "Unable to fetch deals",
      });
    }
  }
);

/**
 * GET /api/deals/:id
 * Get a single deal
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

      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({
          message: "Deal not found",
        });
        return;
      }

      const deal = await Deal.findOne({
        _id: id,
        userId: req.userId,
      }).populate("customerId", "name company email");

      if (!deal) {
        res.status(404).json({
          message: "Deal not found",
        });
        return;
      }

      res.status(200).json({
        deal,
      });
    } catch {
      res.status(500).json({
        message: "Unable to fetch deal",
      });
    }
  }
);

/**
 * PUT /api/deals/:id
 * Update a deal
 */
router.put(
  "/:id",
  requireAuth,
  validate(dealSchema),
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { customerId } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({
          message: "Deal not found",
        });
        return;
      }

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

      const deal = await Deal.findOneAndUpdate(
        {
          _id: id,
          userId: req.userId,
        },
        {
          $set: {
            ...req.body,
            customerId: new Types.ObjectId(customerId),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("customerId", "name company email");

      if (!deal) {
        res.status(404).json({
          message: "Deal not found",
        });
        return;
      }

      res.status(200).json({
        message: "Deal updated successfully",
        deal,
      });
    } catch {
      res.status(500).json({
        message: "Unable to update deal",
      });
    }
  }
);

/**
 * DELETE /api/deals/:id
 * Delete a deal
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

      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({
          message: "Deal not found",
        });
        return;
      }

      const deal = await Deal.findOneAndDelete({
        _id: id,
        userId: req.userId,
      });

      if (!deal) {
        res.status(404).json({
          message: "Deal not found",
        });
        return;
      }

      res.status(200).json({
        message: "Deal deleted successfully",
      });
    } catch {
      res.status(500).json({
        message: "Unable to delete deal",
      });
    }
  }
);

export default router;