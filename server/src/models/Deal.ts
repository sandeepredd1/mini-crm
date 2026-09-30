import mongoose, { Document, Schema } from "mongoose";

export type DealStage =
  | "Lead"
  | "Qualified"
  | "Proposal"
  | "Won"
  | "Lost";

export interface IDeal extends Document {
  userId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dealSchema = new Schema<IDeal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    stage: {
      type: String,
      enum: ["Lead", "Qualified", "Proposal", "Won", "Lost"],
      required: true,
      default: "Lead",
    },

    expectedCloseDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

dealSchema.index({ userId: 1, stage: 1 });
dealSchema.index({ userId: 1, customerId: 1 });
dealSchema.index({ userId: 1, createdAt: -1 });

const Deal = mongoose.model<IDeal>("Deal", dealSchema);

export default Deal;