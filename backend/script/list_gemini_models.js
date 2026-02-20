#!/usr/bin/env node
import "dotenv/config";

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('GEMINI_API_KEY missing');
  process.exit(2);
}

(async () => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
    const res = await fetch(url);
    console.log('status', res.status);
    const txt = await res.text();
    try { console.log(JSON.stringify(JSON.parse(txt), null, 2)); }
    catch(e){ console.log(txt); }
  } catch (err) {
    console.error('fetch error', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
