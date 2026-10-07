import { createHash } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../app.ts';
import { clearTestDatabase, signUpUser, startTestDatabase, stopTestDatabase } from '../../test/database.ts';
import { PasswordResetTokenModel, SessionModel, UserModel } from './auth.model.ts';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

beforeAll(startTestDatabase);
afterAll(stopTestDatabase);
beforeEach(clearTestDatabase);

describe('POST /api/v1/auth/signup', () => {
  it('creates the user, returns only public fields, and sets a hardened session cookie', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: '  Ananya Sharma ', email: 'Ananya@Example.com', password: 'correct-horse-battery' })
      .expect(201);

    expect(Object.keys(response.body.data).sort()).toEqual(['createdAt', 'email', 'id', 'name']);
    expect(response.body.data.name).toBe('Ananya Sharma');

    const cookie = (response.headers['set-cookie'] as unknown as string[])[0]!;
    expect(cookie).toMatch(/^bbb_session=[0-9a-f]{64};/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).toMatch(/Path=\//);
    // NODE_ENV=test, so Secure is intentionally off; it must be on in production.
    expect(cookie).not.toMatch(/Secure/);
  });

  it('stores a bcrypt hash and a hashed session token, never the raw secrets', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'A', email: 'a@example.com', password: 'correct-horse-battery' })
      .expect(201);
    const rawToken = (response.headers['set-cookie'] as unknown as string[])[0]!.split(';')[0]!.split('=')[1]!;

    const user = await UserModel.findOne({ emailNormalized: 'a@example.com' }).lean();
    expect(user!.passwordHash).toMatch(/^\$2[aby]\$12\$/);
    expect(user!.passwordHash).not.toContain('correct-horse-battery');

    const session = await SessionModel.findOne({ userId: user!._id }).lean();
    expect(session!.tokenHash).toBe(sha256(rawToken));
    expect(session!.tokenHash).not.toBe(rawToken);
  });

  it('rejects a duplicate email case-insensitively with 409', async () => {
    await signUpUser({ email: 'dup@example.com' });
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'B', email: '  DUP@example.COM ', password: 'correct-horse-battery' })
      .expect(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it.each([
    ['missing name', { email: 'x@example.com', password: 'correct-horse-battery' }, 'name'],
    ['blank name', { name: '   ', email: 'x@example.com', password: 'correct-horse-battery' }, 'name'],
    ['invalid email', { name: 'X', email: 'not-an-email', password: 'correct-horse-battery' }, 'email'],
    ['7-char password', { name: 'X', email: 'x@example.com', password: '1234567' }, 'password'],
    ['201-char password', { name: 'X', email: 'x@example.com', password: 'p'.repeat(201) }, 'password'],
  ])('rejects %s with 400 VALIDATION_ERROR', async (_label, body, field) => {
    const response = await request(app).post('/api/v1/auth/signup').send(body).expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.map((detail: { field: string }) => detail.field)).toContain(field);
    expect(await UserModel.countDocuments()).toBe(0);
  });

  it('accepts an 8-char password (boundary)', async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'X', email: 'x@example.com', password: '12345678' })
      .expect(201);
  });

  it('ignores attempts to mass-assign internal fields', async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'X', email: 'x@example.com', password: 'correct-horse-battery', passwordHash: 'pwned', _id: 'x' })
      .expect(201);
    const user = await UserModel.findOne({ emailNormalized: 'x@example.com' }).lean();
    expect(user!.passwordHash).not.toBe('pwned');
  });
});

describe('login, session, logout', () => {
  it('logs in with the right password regardless of email casing and returns a working session', async () => {
    await signUpUser({ email: 'kabir@example.com', password: 'correct-horse-battery' });
    const agent = request.agent(app);

    await agent.post('/api/v1/auth/login').send({ email: 'KABIR@example.com', password: 'correct-horse-battery' }).expect(200);
    const me = await agent.get('/api/v1/auth/me').expect(200);
    expect(me.body.data.email).toBe('kabir@example.com');
  });

  it('returns the same 401 message for a wrong password and an unknown email (no account enumeration)', async () => {
    await signUpUser({ email: 'kabir@example.com' });

    const wrongPassword = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'kabir@example.com', password: 'wrong-password' })
      .expect(401);
    const unknownEmail = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrong-password' })
      .expect(401);

    expect(wrongPassword.body.error.message).toBe('Invalid email or password.');
    expect(unknownEmail.body.error.message).toBe(wrongPassword.body.error.message);
    expect(wrongPassword.headers['set-cookie']).toBeUndefined();
  });

  it('logout revokes the session server-side, not just the cookie', async () => {
    const user = await signUpUser();
    await user.agent.post('/api/v1/auth/logout').expect(204);

    // Replaying the old cookie must fail even though a client could have kept a copy.
    await request(app).get('/api/v1/auth/me').set('Cookie', user.cookie).expect(401);
    expect(await SessionModel.countDocuments()).toBe(0);
  });

  it('logging out one device leaves other sessions intact', async () => {
    const user = await signUpUser({ email: 'multi@example.com', password: 'correct-horse-battery' });
    const secondDevice = request.agent(app);
    await secondDevice.post('/api/v1/auth/login').send({ email: 'multi@example.com', password: 'correct-horse-battery' });

    await user.agent.post('/api/v1/auth/logout').expect(204);
    await secondDevice.get('/api/v1/auth/me').expect(200);
  });

  it('rejects a forged or unknown session token', async () => {
    await request(app).get('/api/v1/auth/me').set('Cookie', `bbb_session=${'a'.repeat(64)}`).expect(401);
  });

  it('rejects an expired session even before the TTL index purges it', async () => {
    const user = await signUpUser();
    await SessionModel.updateMany({}, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    await request(app).get('/api/v1/auth/me').set('Cookie', user.cookie).expect(401);
  });

  it('rejects a session whose user no longer exists', async () => {
    const user = await signUpUser();
    await UserModel.deleteMany({});
    await request(app).get('/api/v1/auth/me').set('Cookie', user.cookie).expect(401);
  });

  it('records lastUsedAt when a session is used', async () => {
    const user = await signUpUser();
    await user.agent.get('/api/v1/auth/me').expect(200);
    await expect.poll(async () => (await SessionModel.findOne().lean())?.lastUsedAt).toBeInstanceOf(Date);
  });
});

describe('password reset', () => {
  async function issueResetToken(userId: string, rawToken: string, expiresAt = new Date(Date.now() + 60_000)) {
    // The raw token is only ever emailed (not implemented yet), so tests plant a known token directly.
    await PasswordResetTokenModel.create({ userId, tokenHash: sha256(rawToken), expiresAt });
  }

  it('forgot-password answers 202 identically for known and unknown emails', async () => {
    const user = await signUpUser({ email: 'known@example.com' });

    const known = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'KNOWN@example.com' }).expect(202);
    const unknown = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'nobody@example.com' }).expect(202);

    expect(known.body).toEqual(unknown.body);
    const tokens = await PasswordResetTokenModel.find().lean();
    expect(tokens).toHaveLength(1);
    expect(tokens[0]!.userId.toString()).toBe(user.id);
    expect(tokens[0]!.expiresAt.getTime() - Date.now()).toBeGreaterThan(59 * 60_000);
  });

  it('resets the password, invalidates every existing session, and burns the token', async () => {
    const user = await signUpUser({ email: 'reset@example.com', password: 'old-password-1' });
    await issueResetToken(user.id, 'raw-reset-token');

    await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'raw-reset-token', password: 'new-password-1' })
      .expect(200);

    await request(app).get('/api/v1/auth/me').set('Cookie', user.cookie).expect(401);
    await request(app).post('/api/v1/auth/login').send({ email: 'reset@example.com', password: 'old-password-1' }).expect(401);
    await request(app).post('/api/v1/auth/login').send({ email: 'reset@example.com', password: 'new-password-1' }).expect(200);

    const reuse = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'raw-reset-token', password: 'another-password' })
      .expect(401);
    expect(reuse.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects an expired reset token', async () => {
    const user = await signUpUser();
    await issueResetToken(user.id, 'expired-token', new Date(Date.now() - 1000));
    await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'expired-token', password: 'new-password-1' })
      .expect(401);
  });

  it('rejects an unknown reset token and a too-short new password', async () => {
    await request(app).post('/api/v1/auth/reset-password').send({ token: 'nope', password: 'new-password-1' }).expect(401);
    await request(app).post('/api/v1/auth/reset-password').send({ token: 'nope', password: 'short' }).expect(400);
  });

  // Regression guard: resetPassword must claim the token atomically so two concurrent requests
  // with the same single-use link cannot both set a password.
  it('a reset token can only be redeemed once, even under concurrent requests', async () => {
    const user = await signUpUser();
    await issueResetToken(user.id, 'race-token');

    const results = await Promise.all(
      ['first-password-1', 'second-password-2'].map((password) =>
        request(app).post('/api/v1/auth/reset-password').send({ token: 'race-token', password }),
      ),
    );
    expect(results.map((result) => result.status).sort()).toEqual([200, 401]);
  });
});

describe('concurrency', () => {
  // Signup checks for an existing user, then bcrypt-hashes (~250ms), then inserts, so concurrent signups for the
  // same email race past the check. The unique index stops the second insert and the service maps E11000 to 409;
  // this guards that mapping (no 500, exactly one account).
  it('two simultaneous signups with the same email yield one 201 and one 409', async () => {
    const body = { name: 'Race', email: 'race@example.com', password: 'correct-horse-battery' };
    const results = await Promise.all([1, 2].map(() => request(app).post('/api/v1/auth/signup').send(body)));
    expect(results.map((result) => result.status).sort()).toEqual([201, 409]);
    expect(await UserModel.countDocuments()).toBe(1);
  });
});
