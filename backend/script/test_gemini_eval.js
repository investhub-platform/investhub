#!/usr/bin/env node
import "dotenv/config";
import mongoose from 'mongoose';
import * as evalService from '../src/services/evaluationService.js';

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not set in .env');
      process.exit(2);
    }
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || undefined });
    console.log('Mongo connected');

    const { Types } = mongoose;
    const startupId = new Types.ObjectId().toString();
    console.log('Calling generateOrFetch for', startupId);
    const res = await evalService.generateOrFetch(startupId, {
      description: 'Test description for Gemini check',
      budget: 10000,
      category: 'Fintech',
    });

    console.log('Result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error during test:');
    console.error(err && err.stack ? err.stack : err);
    if (err && err.response) console.error('ERR RESPONSE', err.response);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
