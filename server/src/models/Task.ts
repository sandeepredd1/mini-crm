import mongoose, { Document, Schema } from "mongoose";

export type TaskPriority = "Low" | "Medium" | "High";

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  dealId?: mongoose.Types.ObjectId;
  title: string;
  dueDate: Date;
  priority: TaskPriority;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
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
      required: false,
      index: true,
    },

    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      required: false,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
      default: "Medium",
    },

    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, customerId: 1 });
taskSchema.index({ userId: 1, dealId: 1 });

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;