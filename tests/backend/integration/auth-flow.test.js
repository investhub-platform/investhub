import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

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
});
