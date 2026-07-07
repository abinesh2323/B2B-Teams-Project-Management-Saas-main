require('ts-node/register/transpile-only');

process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret';
process.env.SESSION_EXPIRES_IN = '1d';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:8000/api/auth/google/callback';
process.env.FRONTEND_ORIGIN = 'https://officehubtech.onslate.com';
process.env.FRONTEND_GOOGLE_CALLBACK_URL = 'http://localhost:5173/google/callback';

const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

test('connectDatabase does not exit the process when Mongo connection fails', async () => {
  const originalConnect = mongoose.connect;
  const originalExit = process.exit;
  const originalConsoleError = console.error;

  let exitCalled = false;
  let exitCode;

  process.exit = ((code) => {
    exitCalled = true;
    exitCode = code;
    throw new Error(`process.exit:${code}`);
  });
  console.error = () => { };
  mongoose.connect = async () => {
    throw new Error('simulated connection failure');
  };

  try {
    const { default: connectDatabase } = require('../src/config/database.config.ts');
    await assert.doesNotReject(connectDatabase);
    assert.equal(exitCalled, false);
    assert.equal(exitCode, undefined);
  } finally {
    process.exit = originalExit;
    console.error = originalConsoleError;
    mongoose.connect = originalConnect;
    delete require.cache[require.resolve('../src/config/database.config.ts')];
  }
});
