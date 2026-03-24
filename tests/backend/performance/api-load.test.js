import autocannon from "autocannon";
import { jest } from "@jest/globals";

jest.setTimeout(30_000);

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

  beforeAll(async () => {
    const { default: app } = await import("../../../backend/src/app.js");

    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));

    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    if (!server) return;
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
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

  it("remains stable during short high-concurrency burst", async () => {
    // Scenario validates burst handling and server stability.
    const result = await runAutocannon({
      url: `${baseUrl}/api/v1/health`,
      connections: 50,
      duration: 3,
      pipelining: 1,
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
  });
});
