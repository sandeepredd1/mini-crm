import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import request from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

process.env.CLIENT_URL = "https://crm.example";
process.env.JWT_SECRET = "api-test-secret";
process.env.NODE_ENV = "test";

vi.mock("../src/models/User", () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../src/models/Customer", () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../src/models/Deal", () => ({ default: {} }));
vi.mock("../src/models/Task", () => ({ default: {} }));

import Customer from "../src/models/Customer";
import User from "../src/models/User";

describe("API authentication and data isolation", () => {
  let app: (typeof import("../src/app"))["default"];

  beforeAll(async () => {
    app = (await import("../src/app")).default;
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("rejects malformed registration with a clear 400 response", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "password" }),
      ])
    );
  });

  it("rejects login when the account does not exist", async () => {
    vi.mocked(User.findOne).mockResolvedValueOnce(null as never);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "missing@example.test", password: "password123" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("sets an httpOnly cookie after a successful login", async () => {
    const password = "correct-horse-battery";
    const account = {
      _id: new Types.ObjectId(),
      name: "Demo User",
      email: "demo@example.test",
      password: await bcrypt.hash(password, 4),
    };
    vi.mocked(User.findOne).mockResolvedValueOnce(account as never);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: account.email, password });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("HttpOnly")])
    );
    expect(response.body.user.email).toBe(account.email);
  });

  it("requires authentication for session restoration", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  it("returns 403 for an origin outside the configured allowlist", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://untrusted.example");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("This origin is not allowed");
  });

  it("returns 404 rather than exposing another user's customer", async () => {
    const ownerId = new Types.ObjectId().toString();
    const customerId = new Types.ObjectId().toString();
    vi.mocked(Customer.findOne).mockResolvedValueOnce(null as never);
    const token = jwt.sign({ userId: ownerId }, process.env.JWT_SECRET!);

    const response = await request(app)
      .get(`/api/customers/${customerId}`)
      .set("Cookie", `token=${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Customer not found");
    expect(Customer.findOne).toHaveBeenCalledWith({
      _id: customerId,
      userId: ownerId,
    });
  });

  it("does not update another user's customer", async () => {
    const ownerId = new Types.ObjectId().toString();
    const customerId = new Types.ObjectId().toString();
    vi.mocked(Customer.findOneAndUpdate).mockResolvedValueOnce(null as never);
    const token = jwt.sign({ userId: ownerId }, process.env.JWT_SECRET!);

    const response = await request(app)
      .put(`/api/customers/${customerId}`)
      .set("Cookie", `token=${token}`)
      .send({
        name: "Changed Name",
        company: "Example Co",
        email: "changed@example.test",
        phone: "+15555550123",
        status: "active",
        notes: "",
      });

    expect(response.status).toBe(404);
    expect(Customer.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: customerId, userId: ownerId },
      { $set: expect.objectContaining({ name: "Changed Name" }) },
      { new: true, runValidators: true }
    );
  });

  it("requires reset-mail configuration without exposing account existence", async () => {
    process.env.SMTP_URL = "";
    process.env.MAIL_FROM = "";
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "demo@example.test" });

    expect(response.status).toBe(503);
    expect(response.body.message).toBe(
      "Password reset email is not configured on this server"
    );
  });

  it("updates the password and consumes a valid one-time reset token", async () => {
    const token = "ab".repeat(32);
    const hashedPassword = "new-hashed-password";
    vi.spyOn(bcrypt, "hash").mockResolvedValue(hashedPassword as never);
    vi.mocked(User.findOneAndUpdate).mockResolvedValueOnce({ _id: new Types.ObjectId() } as never);

    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({ token, password: "new-secure-password" });

    expect(response.status).toBe(200);
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      {
        resetTokenHash: createHash("sha256").update(token).digest("hex"),
        resetTokenExpiresAt: { $gt: expect.any(Date) },
      },
      {
        $set: { password: hashedPassword },
        $unset: { resetTokenHash: 1, resetTokenExpiresAt: 1 },
      },
      { new: true }
    );
  });

  it("rejects an expired or unknown reset token", async () => {
    vi.mocked(User.findOneAndUpdate).mockResolvedValueOnce(null as never);
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "cd".repeat(32), password: "new-secure-password" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "This password reset link is invalid or has expired"
    );
  });
});
