#!/usr/bin/env node
import "dotenv/config";
import crypto from "crypto";

// Simple CLI arg parsing: --key=value
const argv = Object.fromEntries(
  process.argv
    .slice(2)
    .map((s) => s.replace(/^--/, "").split("="))
);

const merchantId = argv.merchantId || process.env.PAYHERE_MERCHANT_ID || "YOUR_MERCHANT_ID";
const merchantSecret = argv.secret || process.env.PAYHERE_SECRET || "your_secret";
const orderId = argv.orderId || "ORDER_TEST_1";
const amount = argv.amount || "1000.00";
const currency = argv.currency || "LKR";
const status_code = argv.status || "2"; // 2 => success
const baseUrl = (argv.url || process.env.BASE_URL || process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

const hashedSecret = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
const md5sig = crypto
  .createHash("md5")
  .update(merchantId + orderId + amount + currency + status_code + hashedSecret)
  .digest("hex")
  .toUpperCase();

const payload = {
  merchant_id: merchantId,
  order_id: orderId,
  payhere_amount: amount,
  payhere_currency: currency,
  status_code: status_code,
  md5sig,
};

console.log("Computed md5sig:", md5sig);
console.log("Posting payload:", JSON.stringify(payload));

// Use global fetch (Node 18+). If unavailable, instruct user to run with Node 18+ or adapt.
(async () => {
  const url = `${baseUrl}/api/v1/wallets/notify`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log(`Response status: ${res.status}`);
    try {
      console.log("Response body:", JSON.parse(text));
    } catch (e) {
      console.log("Response body (raw):", text);
    }
  } catch (err) {
    console.error("Request failed:", err.message || err);
    process.exit(1);
  }
})();
