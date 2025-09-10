import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

// Declaring a global `signin` function available in the test environment.
// It returns a Promise that resolves to a string[] (e.g., a mocked cookie/session).
// This allows tests to call `global.signin()` without importing it everywhere.
declare global {
  var signin: () => Promise<string[]>
}

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

global.signin = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password
    })
    .expect(201)

  const cookie = response.get('Set-Cookie');

  if (!cookie) {
    throw new Error("Failed to get cookie from response");
  }

  return cookie;
};