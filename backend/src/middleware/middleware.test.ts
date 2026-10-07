import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import app from '../app.ts';
import { ApiError } from '../utils/api-error.ts';
import { errorHandler } from './error-handler.ts';
import { requestIdMiddleware } from './request-id.ts';

function appThatThrows(error: unknown) {
  const testApp = express();
  testApp.use(requestIdMiddleware);
  testApp.get('/boom', () => {
    throw error;
  });
  testApp.use(errorHandler);
  return testApp;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('request IDs', () => {
  it('generates a request ID when none is supplied', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);
    expect(response.headers['x-request-id']).toMatch(/^req_[0-9a-f-]{36}$/);
  });

  it('echoes a well-formed client request ID', async () => {
    const response = await request(app).get('/api/v1/health').set('X-Request-Id', 'client.abc-123_X').expect(200);
    expect(response.headers['x-request-id']).toBe('client.abc-123_X');
  });

  it.each([
    ['contains disallowed characters', 'bad id<script>'],
    ['is longer than 128 characters', 'a'.repeat(129)],
  ])('replaces a client request ID that %s', async (_label, suppliedId) => {
    const response = await request(app).get('/api/v1/health').set('X-Request-Id', suppliedId).expect(200);
    expect(response.headers['x-request-id']).toMatch(/^req_/);
  });
});

describe('error responses', () => {
  it('returns the shared error envelope for unknown routes', async () => {
    const response = await request(app).get('/api/v1/does-not-exist').set('X-Request-Id', 'rid-1').expect(404);
    expect(response.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Route not found.', details: [], requestId: 'rid-1' },
    });
  });

  it.each([
    ['VALIDATION_ERROR', 400],
    ['UNAUTHENTICATED', 401],
    ['FORBIDDEN', 403],
    ['NOT_FOUND', 404],
    ['CONFLICT', 409],
    ['RATE_LIMITED', 429],
    ['INTERNAL_ERROR', 500],
  ] as const)('maps ApiError %s to HTTP %i', async (code, status) => {
    const response = await request(appThatThrows(new ApiError(code, 'msg', [{ field: 'f', message: 'm' }])))
      .get('/boom')
      .expect(status);
    expect(response.body.error).toMatchObject({ code, message: 'msg', details: [{ field: 'f', message: 'm' }] });
  });

  it('turns a ZodError into a 400 with field-level details', async () => {
    const result = z.object({ email: z.string().email(), nested: z.object({ n: z.number() }) }).safeParse({
      email: 'nope',
      nested: { n: 'x' },
    });
    const response = await request(appThatThrows(result.error)).get('/boom').expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.map((detail: { field: string }) => detail.field).sort()).toEqual([
      'email',
      'nested.n',
    ]);
  });

  it('hides internal error details from the client and logs them server-side', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await request(appThatThrows(new Error('db password is hunter2'))).get('/boom').expect(500);

    expect(response.body.error).toMatchObject({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
    expect(JSON.stringify(response.body)).not.toContain('hunter2');
    expect(consoleError).toHaveBeenCalled();
  });

  // Regression guard: body-parser errors are client errors and must keep their 4xx status, not become a 500.
  it('rejects a malformed JSON body with 400, not 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "a@b.com",')
      .expect(400);
  });

  it('rejects an oversized JSON body with 413, not 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@b.com', password: 'x'.repeat(200_000) })
      .expect(413);
  });
});

describe('authentication guard (no database needed)', () => {
  it.each([
    ['GET', '/api/v1/auth/me'],
    ['GET', '/api/v1/weddings/current'],
    ['POST', '/api/v1/weddings'],
    ['GET', '/api/v1/weddings/507f1f77bcf86cd799439011/events'],
    ['GET', '/api/v1/weddings/507f1f77bcf86cd799439011/dashboard'],
  ])('%s %s returns 401 without a session cookie', async (method, path) => {
    const response = await request(app)[method === 'GET' ? 'get' : 'post'](path).expect(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('logout without a session cookie still succeeds and clears the cookie', async () => {
    const response = await request(app).post('/api/v1/auth/logout').expect(204);
    expect(String(response.headers['set-cookie'])).toMatch(/bbb_session=;/);
  });
});
