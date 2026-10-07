import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.ts';

let replSet: MongoMemoryReplSet | undefined;

/**
 * Boots a single-node replica set (wedding creation uses transactions, which a standalone
 * mongod rejects) and connects the app's shared mongoose instance to it.
 */
export async function startTestDatabase(): Promise<void> {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  await mongoose.connect(replSet.getUri());
  // Unique indexes back several business rules (one membership per user, unique slugs); build them up front.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

export async function stopTestDatabase(): Promise<void> {
  await mongoose.disconnect();
  await replSet?.stop();
  replSet = undefined;
}

export async function clearTestDatabase(): Promise<void> {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export interface TestUser {
  id: string;
  cookie: string;
  agent: ReturnType<typeof request.agent>;
}

let userCounter = 0;

/** Signs up a fresh user through the real API and returns a cookie-carrying supertest agent. */
export async function signUpUser(overrides: { name?: string; email?: string; password?: string } = {}): Promise<TestUser> {
  userCounter += 1;
  const agent = request.agent(app);
  const response = await agent
    .post('/api/v1/auth/signup')
    .send({
      name: overrides.name ?? `Test User ${userCounter}`,
      email: overrides.email ?? `user${userCounter}@example.com`,
      password: overrides.password ?? 'correct-horse-battery',
    })
    .expect(201);

  const setCookie = response.headers['set-cookie'] as unknown as string[];
  return { id: response.body.data.id, cookie: setCookie[0]!.split(';')[0]!, agent };
}

export function validWeddingInput(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    brideName: 'Ananya',
    groomName: 'Kabir',
    weddingDate: '2026-12-12',
    timeZone: 'Asia/Kolkata',
    location: { formattedAddress: 'Rambagh Palace, Jaipur', city: 'Jaipur', state: 'Rajasthan', country: 'India' },
    ...overrides,
  };
}

/** Signs up a user and creates their wedding; returns both. */
export async function signUpUserWithWedding(
  weddingOverrides: Record<string, unknown> = {},
): Promise<TestUser & { weddingId: string }> {
  const user = await signUpUser();
  const response = await user.agent.post('/api/v1/weddings').send(validWeddingInput(weddingOverrides)).expect(201);
  return { ...user, weddingId: response.body.data.id };
}
