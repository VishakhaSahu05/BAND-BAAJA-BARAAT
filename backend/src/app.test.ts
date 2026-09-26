import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from './app.ts';

describe('GET /api/v1/health', () => {
  it('returns the API health response without requiring MongoDB', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Band Baaja Baaraat API is running',
    });
  });
});
