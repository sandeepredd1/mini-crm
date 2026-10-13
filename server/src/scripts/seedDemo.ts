import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Customer from "../models/Customer";
import Deal from "../models/Deal";
import Task from "../models/Task";
import User from "../models/User";
import { connectDB } from "../config/db";

async function seedDemo(): Promise<void> {
  const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
  const password = process.env.DEMO_PASSWORD;
  const name = process.env.DEMO_NAME?.trim() || "Demo User";

  if (!email || !password || password.length < 8) {
    throw new Error("Set DEMO_EMAIL and DEMO_PASSWORD (at least 8 characters)");
  }

  await connectDB();

  const existingUser = await User.findOne({ email });
  const user =
    existingUser ??
    (await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
    }));

  const existingCustomerCount = await Customer.countDocuments({
    userId: user._id,
  });
  if (existingCustomerCount > 0) {
    throw new Error("The configured demo account already contains customer data");
  }

  const customers = await Customer.insertMany([
    {
      userId: user._id,
      name: "Jordan Lee",
      company: "Northstar Studio",
      email: "jordan@example.test",
      phone: "+1 555 010 2101",
      status: "active",
      notes: "Interested in the annual services plan.",
    },
    {
      userId: user._id,
      name: "Morgan Patel",
      company: "Brightpath Labs",
      email: "morgan@example.test",
      phone: "+1 555 010 2102",
      status: "lead",
      notes: "Schedule a product walkthrough.",
    },
    {
      userId: user._id,
      name: "Casey Rivera",
      company: "Fieldwork Co.",
      email: "casey@example.test",
      phone: "+1 555 010 2103",
      status: "inactive",
      notes: "",
    },
  ]);

  const closeDate = new Date();
  closeDate.setDate(closeDate.getDate() + 30);
  const deals = await Deal.insertMany([
    {
      userId: user._id,
      customerId: customers[0]._id,
      title: "Annual support renewal",
      value: 18000,
      stage: "Proposal",
      expectedCloseDate: closeDate,
    },
    {
      userId: user._id,
      customerId: customers[1]._id,
      title: "CRM onboarding",
      value: 9500,
      stage: "Qualified",
      expectedCloseDate: closeDate,
    },
    {
      userId: user._id,
      customerId: customers[0]._id,
      title: "Analytics add-on",
      value: 4200,
      stage: "Lead",
      expectedCloseDate: closeDate,
    },
  ]);

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const overdue = new Date(today);
  overdue.setDate(overdue.getDate() - 2);
  const upcoming = new Date(today);
  upcoming.setDate(upcoming.getDate() + 3);
  await Task.insertMany([
    {
      userId: user._id,
      customerId: customers[0]._id,
      dealId: deals[0]._id,
      title: "Review renewal proposal",
      dueDate: today,
      priority: "High",
      completed: false,
    },
    {
      userId: user._id,
      customerId: customers[1]._id,
      dealId: deals[1]._id,
      title: "Send onboarding outline",
      dueDate: overdue,
      priority: "Medium",
      completed: false,
    },
    {
      userId: user._id,
      customerId: customers[0]._id,
      title: "Check in after demo",
      dueDate: upcoming,
      priority: "Low",
      completed: false,
    },
  ]);

  console.info("Seeded demo workspace with 3 customers, 3 deals, and 3 tasks.");
}

seedDemo()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Demo data seeding failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
