import dotenv from 'dotenv';

// Load environment variables before tests run
dotenv.config();

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

// Declaring a global `signin` function available in the test environment.
// It returns a Promise that resolves to a string[] (e.g., a mocked cookie/session).
// This allows tests to call `global.signin()` without importing it everywhere.
declare global {
  var signin: (id?: string) => string[];
}

// Mock the NATS wrapper so tests don’t create a real NATS connection.
// This replaces the actual implementation with a mock version,
// letting us isolate and test our code without relying on external NATS.
jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
  'sk_test_51S4gG6LkyGA9qm3YTeRelK6x7WWPUpnKMw10FBTQAeOhHrWbegULp641hIgFdNAsjN4WyxwLeZfDlZxnkqgsZUMx00wGvhFRnt';

let mongo: any;

// Runs once before all tests start: spin up an in-memory MongoDB instance
// and establish a Mongoose connection to it
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfef';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

// Runs before each test: reset all collections so tests start with a clean DB
beforeEach(async () => {
  jest.clearAllMocks();
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

// Runs once after all tests finish: stop the in-memory MongoDB instance
// and close the Mongoose connection
afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object. {jwt: MY_JWT}
  const session = { jwt: token };

  // Turn that session into json
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  return [`session=${base64}`];
};
