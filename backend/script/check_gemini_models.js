#!/usr/bin/env node
import "dotenv/config";
import { GoogleGenerativeAI } from '@google/generative-ai';

(async () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not set in environment');
      process.exit(2);
    }

    const client = new GoogleGenerativeAI(apiKey);
    // Show available methods on the SDK client for debugging
    console.log('Client prototype methods:', Object.keys(Object.getPrototypeOf(client)).filter(k=>typeof client[k] === 'function'));
    console.log('Client own keys:', Object.keys(client));
    console.log('Client own function keys:', Object.keys(client).filter(k=>typeof client[k] === 'function'));

    if (typeof client.listModels === 'function') {
      const res = await client.listModels();
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.warn('listModels() not present on SDK client. Try using model names like "gemini-1" or "gemini-1.5" and ensure the key has access.');
    }
  } catch (err) {
    console.error('Error listing models:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
