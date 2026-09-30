import { Router, Response } from "express";
import { Types } from "mongoose";

import Customer from "../models/Customer";
import {
  AuthenticatedRequest,
  requireAuth,
} from "../middleware/auth";
import { validate } from "../middleware/validate";
import { customerSchema } from "../validation/schemas";

const router = Router();

/**
 * POST /api/customers
 * Create a customer
 */
router.post(
  "/",
  requireAuth,
  validate(customerSchema),
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const customer = await Customer.create({
        ...req.body,
        userId: new Types.ObjectId(req.userId),
      });

      res.status(201).json({
        message: "Customer created successfully",
        customer,
      });
    } catch {
      res.status(500).json({
        message: "Unable to create customer",
      });
    }
  }
);

/**
 * GET /api/customers/:id
 * Get a single customer
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
          message: "Customer not found",
        });
        return;
      }

      const customer = await Customer.findOne({
        _id: id,
        userId: req.userId,
      });

      if (!customer) {
        res.status(404).json({
          message: "Customer not found",
        });
        return;
      }

      res.status(200).json({
        customer,
      });
    } catch {
      res.status(500).json({
        message: "Unable to fetch customer",
      });
    }
  }
);

/**
 * PUT /api/customers/:id
 * Update a customer
 */
router.put(
  "/:id",
  requireAuth,
  validate(customerSchema),
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({
          message: "Customer not found",
        });
        return;
      }

      const customer = await Customer.findOneAndUpdate(
        {
          _id: id,
          userId: req.userId,
        },
        {
          $set: req.body,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!customer) {
        res.status(404).json({
          message: "Customer not found",
        });
        return;
      }

      res.status(200).json({
        message: "Customer updated successfully",
        customer,
      });
    } catch {
      res.status(500).json({
        message: "Unable to update customer",
      });
    }
  }
);

/**
 * DELETE /api/customers/:id
 * Delete a customer
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
          message: "Customer not found",
        });
        return;
      }

      const customer = await Customer.findOneAndDelete({
        _id: id,
        userId: req.userId,
      });

      if (!customer) {
        res.status(404).json({
          message: "Customer not found",
        });
        return;
      }

      res.status(200).json({
        message: "Customer deleted successfully",
      });
    } catch {
      res.status(500).json({
        message: "Unable to delete customer",
      });
    }
  }
);

/**
 * GET /api/customers
 * List customers with search, status filter and pagination
 */
router.get(
  "/",
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const search =
        typeof req.query.search === "string"
          ? req.query.search.trim()
          : "";

      const status =
        typeof req.query.status === "string"
          ? req.query.status
          : "";

      const pageValue =
        typeof req.query.page === "string"
          ? Number(req.query.page)
          : 1;

      const limitValue =
        typeof req.query.limit === "string"
          ? Number(req.query.limit)
          : 10;

      const page =
        Number.isInteger(pageValue) && pageValue > 0
          ? pageValue
          : 1;

      const limit =
        Number.isInteger(limitValue) &&
        limitValue > 0 &&
        limitValue <= 100
          ? limitValue
          : 10;

      const query: Record<string, unknown> = {
        userId: req.userId,
      };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      if (["active", "inactive", "lead"].includes(status)) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const [customers, total] = await Promise.all([
        Customer.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        Customer.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        customers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch {
      res.status(500).json({
        message: "Unable to fetch customers",
      });
    }
  }
);

export default router;