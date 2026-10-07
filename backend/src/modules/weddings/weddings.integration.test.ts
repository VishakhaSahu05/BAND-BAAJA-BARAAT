import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearTestDatabase,
  signUpUser,
  signUpUserWithWedding,
  startTestDatabase,
  stopTestDatabase,
  validWeddingInput,
} from '../../test/database.ts';
import { EventModel } from '../events/events.model.ts';
import { WeddingMembershipModel, WeddingModel } from './weddings.model.ts';

beforeAll(startTestDatabase);
afterAll(stopTestDatabase);
beforeEach(clearTestDatabase);

describe('POST /api/v1/weddings', () => {
  it('creates the wedding, an OWNER membership, and one event per ritual in a single transaction', async () => {
    const user = await signUpUser();
    const response = await user.agent
      .post('/api/v1/weddings')
      .send(
        validWeddingInput({
          budgetPaise: 50_00_000_00,
          ceremonySpan: '3_DAYS',
          guestEstimate: { total: 300, groomSide: 150, brideSide: 150 },
          rituals: [{ name: 'Mehendi', type: 'MEHENDI' }, { name: 'Sangeet', type: 'SANGEET' }, { name: 'Pheras' }],
        }),
      )
      .expect(201);

    const wedding = response.body.data;
    expect(wedding).toMatchObject({
      brideName: 'Ananya',
      groomName: 'Kabir',
      websiteSlug: 'ananya-kabir',
      isItineraryPrivate: true,
      budgetPaise: 50_00_000_00,
    });
    expect(new Date(wedding.weddingDate).toISOString()).toBe('2026-12-12T00:00:00.000Z');

    const membership = await WeddingMembershipModel.findOne({ userId: user.id }).lean();
    expect(membership).toMatchObject({ access: 'OWNER' });
    expect(membership!.weddingId.toString()).toBe(wedding.id);

    const events = await EventModel.find({ weddingId: wedding.id }).lean();
    expect(events.map((event) => event.name).sort()).toEqual(['Mehendi', 'Pheras', 'Sangeet']);
  });

  it('never leaks internal secrets (gallery token hash, creator id) in the response', async () => {
    const user = await signUpUser();
    const response = await user.agent.post('/api/v1/weddings').send(validWeddingInput()).expect(201);
    const body = JSON.stringify(response.body);
    const stored = await WeddingModel.findById(response.body.data.id).lean();

    expect(body).not.toContain(stored!.gallery.tokenHash);
    expect(response.body.data).not.toHaveProperty('gallery');
    expect(response.body.data).not.toHaveProperty('createdByUserId');
  });

  it('does not let the client choose the website slug, owner, or publish state', async () => {
    const user = await signUpUser();
    const other = await signUpUser();
    const response = await user.agent
      .post('/api/v1/weddings')
      .send(
        validWeddingInput({
          website: { slug: 'hijacked', isPublished: true },
          createdByUserId: other.id,
          deletedAt: new Date().toISOString(),
        }),
      )
      .expect(201);

    const stored = await WeddingModel.findById(response.body.data.id).lean();
    expect(stored!.website).toMatchObject({ slug: 'ananya-kabir', isPublished: false });
    expect(stored!.createdByUserId.toString()).toBe(user.id);
    expect(stored!.deletedAt).toBeUndefined();
  });

  it('gives each couple with the same names a distinct website slug', async () => {
    const first = await signUpUserWithWedding();
    const second = await signUpUserWithWedding();
    const slugs = await WeddingModel.find({ _id: { $in: [first.weddingId, second.weddingId] } }).distinct('website.slug');
    expect(slugs).toHaveLength(2);
    expect(slugs).toContain('ananya-kabir');
    expect(slugs.find((slug) => slug !== 'ananya-kabir')).toMatch(/^ananya-kabir-[0-9a-f]{6}$/);
  });

  it('falls back to a generic slug for names with no latin characters', async () => {
    const user = await signUpUser();
    const response = await user.agent
      .post('/api/v1/weddings')
      .send(validWeddingInput({ brideName: 'अनन्या', groomName: 'कबीर' }))
      .expect(201);
    expect(response.body.data.websiteSlug).toBe('our-wedding');
  });

  it('rejects a second wedding for the same user with 409 and creates nothing', async () => {
    const user = await signUpUserWithWedding();
    const response = await user.agent.post('/api/v1/weddings').send(validWeddingInput()).expect(409);
    expect(response.body.error.code).toBe('CONFLICT');
    expect(await WeddingModel.countDocuments()).toBe(1);
  });

  // Regression guard: slug collisions from concurrent creates are retried with a fresh slug, and a same-user
  // double-submit maps the membership duplicate to 409 rather than 500.
  it('concurrent create requests for one user return 201 + 409, not 500', async () => {
    const user = await signUpUser();
    const results = await Promise.all(
      [1, 2].map(() => user.agent.post('/api/v1/weddings').send(validWeddingInput())),
    );
    expect(results.map((result) => result.status).sort()).toEqual([201, 409]);
  });

  it('two different users onboarding the same couple names at once both succeed', async () => {
    const [first, second] = await Promise.all([signUpUser(), signUpUser()]);
    const results = await Promise.all(
      [first, second].map((user) => user.agent.post('/api/v1/weddings').send(validWeddingInput())),
    );
    expect(results.map((result) => result.status)).toEqual([201, 201]);
  });

  it('rolls back the wedding and membership if creating a ritual event fails mid-transaction', async () => {
    const user = await signUpUser();
    // Force the events insert (last step of the transaction) to fail with a collection validator.
    const db = mongoose.connection.db!;
    await EventModel.createCollection();
    await db.command({ collMod: 'events', validator: { name: { $ne: 'Explode' } } });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await user.agent
        .post('/api/v1/weddings')
        .send(validWeddingInput({ rituals: [{ name: 'Explode' }] }))
        .expect(500);

      expect(await WeddingModel.countDocuments()).toBe(0);
      expect(await WeddingMembershipModel.countDocuments()).toBe(0);
    } finally {
      consoleError.mockRestore();
      await db.command({ collMod: 'events', validator: {} });
    }
  });

  it.each([
    ['missing location', { location: undefined }, 'location'],
    ['blank city', { location: { formattedAddress: 'x', city: ' ', state: 's', country: 'c' } }, 'location.city'],
    ['invalid date', { weddingDate: 'not-a-date' }, 'weddingDate'],
    ['negative budget', { budgetPaise: -1 }, 'budgetPaise'],
    ['fractional paise', { budgetPaise: 10.5 }, 'budgetPaise'],
    ['hashtag with spaces', { hashtag: '#ananya weds kabir' }, 'hashtag'],
    ['unknown ritual type', { rituals: [{ name: 'Tilak', type: 'TILAK' }] }, 'rituals.0.type'],
    ['21 rituals', { rituals: Array.from({ length: 21 }, (_, i) => ({ name: `R${i}` })) }, 'rituals'],
    ['latitude out of range', { location: { formattedAddress: 'x', city: 'c', state: 's', country: 'c', latitude: 91 } }, 'location.latitude'],
    ['unknown ceremony span', { ceremonySpan: '7_DAYS' }, 'ceremonySpan'],
  ])('rejects %s with 400 and writes nothing', async (_label, overrides, field) => {
    const user = await signUpUser();
    const response = await user.agent.post('/api/v1/weddings').send(validWeddingInput(overrides)).expect(400);
    expect(response.body.error.details.map((detail: { field: string }) => detail.field)).toContain(field);
    expect(await WeddingModel.countDocuments()).toBe(0);
  });

  // Regression guard: the two sides of the guest estimate must add up to the total.
  it('rejects a guest estimate whose sides do not add up to the total', async () => {
    const user = await signUpUser();
    await user.agent
      .post('/api/v1/weddings')
      .send(validWeddingInput({ guestEstimate: { total: 100, groomSide: 400, brideSide: 400 } }))
      .expect(400);
  });
});

describe('GET /api/v1/weddings/current', () => {
  it('returns the caller’s own wedding', async () => {
    const user = await signUpUserWithWedding();
    const response = await user.agent.get('/api/v1/weddings/current').expect(200);
    expect(response.body.data.id).toBe(user.weddingId);
  });

  it('returns 404 NOT_FOUND before onboarding (the frontend relies on this to route to /onboarding)', async () => {
    const user = await signUpUser();
    const response = await user.agent.get('/api/v1/weddings/current').expect(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('treats a soft-deleted wedding as not found', async () => {
    const user = await signUpUserWithWedding();
    await WeddingModel.updateOne({ _id: user.weddingId }, { $set: { deletedAt: new Date() } });
    await user.agent.get('/api/v1/weddings/current').expect(404);
  });
});

describe('tenant isolation (the wedding is the tenant boundary)', () => {
  it.each(['events', 'dashboard'])('a member of wedding A cannot read wedding B’s %s', async (resource) => {
    const alice = await signUpUserWithWedding({ rituals: [{ name: 'Alice Sangeet' }] });
    const bob = await signUpUserWithWedding({ brideName: 'Bina', rituals: [{ name: 'Bob Haldi' }] });

    const response = await alice.agent.get(`/api/v1/weddings/${bob.weddingId}/${resource}`).expect(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
    expect(JSON.stringify(response.body)).not.toContain('Bob Haldi');
  });

  it.each(['events', 'dashboard'])('a user with no wedding cannot read any wedding’s %s', async (resource) => {
    const owner = await signUpUserWithWedding();
    const outsider = await signUpUser();
    await outsider.agent.get(`/api/v1/weddings/${owner.weddingId}/${resource}`).expect(403);
  });

  it.each(['not-an-object-id', '000000000000000000000000', '%24ne'])(
    'a malformed or unknown weddingId (%s) is 403, never 500',
    async (weddingId) => {
      const user = await signUpUserWithWedding();
      await user.agent.get(`/api/v1/weddings/${weddingId}/events`).expect(403);
      await user.agent.get(`/api/v1/weddings/${weddingId}/dashboard`).expect(403);
    },
  );

  it('a member can list their own events, sorted by start time, excluding archived ones', async () => {
    const user = await signUpUserWithWedding();
    const weddingId = new mongoose.Types.ObjectId(user.weddingId);
    await EventModel.create([
      { weddingId, name: 'Reception', startsAt: new Date('2026-12-13') },
      { weddingId, name: 'Haldi', startsAt: new Date('2026-12-11') },
      { weddingId, name: 'Old plan', startsAt: new Date('2026-12-10'), archivedAt: new Date() },
    ]);

    const response = await user.agent.get(`/api/v1/weddings/${user.weddingId}/events`).expect(200);
    expect(response.body.data.map((event: { name: string }) => event.name)).toEqual(['Haldi', 'Reception']);
  });
});
