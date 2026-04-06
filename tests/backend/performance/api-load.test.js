import autocannon from "autocannon";
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

const { default: User } = await import("../../../backend/src/models/User.js");
const { default: Wallet } = await import("../../../backend/src/models/Wallet.js");
const { default: Startup } = await import("../../../backend/src/models/Startup.js");
const { default: Idea } = await import("../../../backend/src/models/Idea.js");
const { default: Request } = await import("../../../backend/src/models/Request.js");

process.env.JWT_ACCESS_SECRET = "performance-access-secret";

jest.setTimeout(60_000);

const runAutocannon = (options) =>
  new Promise((resolve, reject) => {
    autocannon(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

describe("Backend API performance", () => {
  let server;
  let baseUrl;
  let mongo;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: "investhub-performance" });

    const { default: app } = await import("../../../backend/src/app.js");

    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));

    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();

    if (!server) return;
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  afterEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Wallet.deleteMany({}),
      Startup.deleteMany({}),
      Idea.deleteMany({}),
      Request.deleteMany({}),
    ]);
  });

  it("handles moderate concurrent traffic with stable latency", async () => {
    // Scenario validates response-time and stability under moderate load.
    const result = await runAutocannon({
      url: `${baseUrl}/api/v1/health`,
      connections: 20,
      duration: 5,
      pipelining: 1,
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.latency.p99).toBeLessThan(750);
  });

  it("keeps startup listing responsive under load", async () => {
    const founder = await User.create({
      name: "Perf Founder",
      email: "perf-founder@example.com",
      passwordHash: "hash",
      status: "active",
      roles: ["user"],
    });

    await Startup.create({
      name: "Perf Startup",
      description: "Load test startup",
      userId: founder._id,
      createdBy: founder._id,
      status: "pending",
    });

    const result = await runAutocannon({
      url: `${baseUrl}/api/v1/startups`,
      connections: 15,
      duration: 4,
      pipelining: 1,
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.latency.p99).toBeLessThan(1000);
  });

  it("handles request lookup traffic without excessive latency", async () => {
    const founder = await User.create({
      name: "Perf Founder 2",
      email: "perf-founder2@example.com",
      passwordHash: "hash",
      status: "active",
      roles: ["user"],
    });

    const investor = await User.create({
      name: "Perf Investor",
      email: "perf-investor@example.com",
      passwordHash: "hash",
      status: "active",
      roles: ["user"],
    });

    const startup = await Startup.create({
      name: "Request Perf Startup",
      description: "Seeded for request lookup load test",
      userId: founder._id,
      createdBy: founder._id,
      status: "pending",
    });

    const idea = await Idea.create({
      StartupId: startup._id,
      title: "Perf Idea",
      description: "Idea for request lookup",
      category: "Tech",
      budget: 2000,
      isIdea: true,
      status: "pending_review",
      createdBy: founder._id,
    });

    await Request.create({
      investorId: investor._id,
      founderId: founder._id,
      ideaId: idea._id,
      direction: "investor_to_startup",
      amount: 1000,
      message: "Perf request",
      requestStatus: "pending_founder",
      createdBy: investor._id,
    });

    const result = await runAutocannon({
      url: `${baseUrl}/api/v1/requests/startup/${startup._id}`,
      connections: 15,
      duration: 3,
      pipelining: 1,
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.latency.p99).toBeLessThan(1000);
  });

  it("keeps authenticated wallet lookups stable under burst traffic", async () => {
    const user = await User.create({
      name: "Perf Wallet User",
      email: "perf-wallet@example.com",
      passwordHash: "hash",
      status: "active",
      roles: ["user"],
    });

    await Wallet.create({ userId: user._id, balance: 5000, currency: "USD" });

    const token = jwt.sign(
      { sub: user._id.toString(), roles: ["user"] },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const result = await runAutocannon({
      url: `${baseUrl}/api/v1/wallets/me`,
      connections: 10,
      duration: 4,
      pipelining: 1,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.latency.p99).toBeLessThan(1000);
  });
});
