import mongoose, { Document, Schema } from "mongoose";

export type CustomerStatus = "active" | "inactive" | "lead";

export interface ICustomer extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "lead"],
      default: "lead",
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({
  userId: 1,
  status: 1,
});

customerSchema.index({
  userId: 1,
  createdAt: -1,
});

const Customer = mongoose.model<ICustomer>(
  "Customer",
  customerSchema
);

export default Customer;