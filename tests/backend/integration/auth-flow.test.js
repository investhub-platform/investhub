import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

process.env.JWT_ACCESS_SECRET = "integration-access-secret";
process.env.JWT_REFRESH_SECRET = "integration-refresh-secret";
process.env.COOKIE_SECURE = "false";
process.env.FRONTEND_URL = "http://localhost:5173";

const sendEmail = jest.fn().mockResolvedValue(undefined);

jest.unstable_mockModule("../../../backend/src/services/emailService.js", () => ({
  sendEmail,
  buildTemplate: ({ title = "", message = "" }) => `<h1>${title}</h1><p>${message}</p>`,
}));

const { default: app } = await import("../../../backend/src/app.js");
const { default: User } = await import("../../../backend/src/models/User.js");
const { default: Startup } = await import("../../../backend/src/models/Startup.js");
const { default: Idea } = await import("../../../backend/src/models/Idea.js");
const { default: Request } = await import("../../../backend/src/models/Request.js");
const { default: Wallet } = await import("../../../backend/src/models/Wallet.js");

let mongo;

describe("Auth + User API integration", () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: "investhub-test" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Startup.deleteMany({});
    await Idea.deleteMany({});
    await Request.deleteMany({});
    await Wallet.deleteMany({});
    jest.clearAllMocks();
  });

  it("registers a user, logs in, and fetches /users/me", async () => {
    const email = "flow@example.com";
    const password = "Password123";

    // Register creates a pending user and triggers verification email.
    const registerRes = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "Flow User", email, password });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.email).toBe(email);
    expect(sendEmail).toHaveBeenCalledTimes(1);

    // Activate account for end-to-end auth flow in integration test.
    await User.updateOne({ email }, { $set: { status: "active" } });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBeTruthy();

    const token = loginRes.body.data.accessToken;

    const meRes = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.email).toBe(email);
  });

  it("denies /users/me without bearer token", async () => {
    const res = await request(app).get("/api/v1/users/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/unauthorized/i);
  });

  it("returns startups persisted in MongoDB", async () => {
    const founder = await User.create({
      name: "Founder One",
      email: "founder1@example.com",
      passwordHash: "hash",
      status: "active",
      roles: ["user"],
    });

    await Startup.create({
      name: "Green Farm",
      description: "Agri startup",
      userId: founder._id,
      createdBy: founder._id,
      status: "pending",
    });

    const res = await request(app).get("/api/v1/startups");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("Green Farm");
  });

  it("creates an investment request and stores it in MongoDB", async () => {
    const investor = await User.create({
      name: "Investor One",
      email: "investor1@example.com",
      passwordHash: "hash",
      status: "active",
      roles: ["user"],
    });

    const founder = await User.create({
      name: "Founder Two",
      email: "founder2@example.com",
      passwordHash: "hash",
      status: "active",
      roles: ["user"],
    });

    const startup = await Startup.create({
      name: "Seed Startup",
      description: "Seeded for integration testing",
      userId: founder._id,
      createdBy: founder._id,
      status: "pending",
    });

    const idea = await Idea.create({
      StartupId: startup._id,
      title: "Seed Idea",
      description: "An idea used for request creation tests",
      category: "Tech",
      budget: 2500,
      isIdea: true,
      status: "pending_review",
      createdBy: founder._id,
    });

    const authToken = jwt.sign(
      { roles: ["user"] },
      process.env.JWT_ACCESS_SECRET,
      { subject: investor._id.toString(), expiresIn: "1h" }
    );

    const res = await request(app)
      .post("/api/v1/requests")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        investorId: investor._id.toString(),
        founderId: founder._id.toString(),
        ideaId: idea._id.toString(),
        amount: 1500,
        message: "Please consider this investment request.",
        direction: "investor_to_startup",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.requestStatus).toBe("pending_founder");

    const stored = await Request.findOne({ ideaId: idea._id });
    expect(stored).toBeTruthy();
    expect(stored.amount).toBe(1500);
    expect(stored.requestStatus).toBe("pending_founder");
  });
});
