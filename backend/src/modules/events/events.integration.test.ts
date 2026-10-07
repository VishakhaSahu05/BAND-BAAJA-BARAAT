import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  clearTestDatabase,
  signUpUser,
  signUpUserWithWedding,
  startTestDatabase,
  stopTestDatabase,
} from '../../test/database.ts';
import { EventModel } from './events.model.ts';

beforeAll(startTestDatabase);
afterAll(stopTestDatabase);
beforeEach(clearTestDatabase);

type Owner = Awaited<ReturnType<typeof signUpUserWithWedding>>;

const validEvent = (overrides: Record<string, unknown> = {}) => ({
  name: 'Sangeet Night',
  type: 'SANGEET',
  startsAt: '2026-12-11T18:30:00+05:30',
  venueName: 'Lawn',
  ...overrides,
});

async function createEvent(owner: Owner, overrides: Record<string, unknown> = {}): Promise<string> {
  const response = await owner.agent
    .post(`/api/v1/weddings/${owner.weddingId}/events`)
    .send(validEvent(overrides))
    .expect(201);
  return response.body.data.id;
}

describe('POST /api/v1/weddings/:weddingId/events', () => {
  it('creates a ceremony scoped to the URL wedding and returns it', async () => {
    const owner = await signUpUserWithWedding();
    const response = await owner.agent.post(`/api/v1/weddings/${owner.weddingId}/events`).send(validEvent()).expect(201);

    expect(response.body.data).toMatchObject({ name: 'Sangeet Night', type: 'SANGEET', weddingId: owner.weddingId });
    expect(response.body.data.startsAt).toBe('2026-12-11T13:00:00.000Z');
  });

  it('ignores a client-supplied weddingId in the body (strict schema rejects it)', async () => {
    const owner = await signUpUserWithWedding();
    const victim = await signUpUserWithWedding();
    await owner.agent
      .post(`/api/v1/weddings/${owner.weddingId}/events`)
      .send(validEvent({ weddingId: victim.weddingId }))
      .expect(400);
    expect(await EventModel.countDocuments({ weddingId: victim.weddingId })).toBe(0);
  });

  it('forbids creating a ceremony in someone else’s wedding', async () => {
    const owner = await signUpUserWithWedding();
    const attacker = await signUpUserWithWedding();
    await attacker.agent.post(`/api/v1/weddings/${owner.weddingId}/events`).send(validEvent()).expect(403);
    expect(await EventModel.countDocuments()).toBe(0);
  });

  it.each([
    ['null date (would coerce to 1970)', { startsAt: null }],
    ['boolean date', { startsAt: true }],
    ['numeric timestamp', { startsAt: 1_700_000_000_000 }],
    ['impossible calendar date', { startsAt: '2026-02-30' }],
    ['free-text date', { startsAt: 'next friday' }],
    ['blank name', { name: '   ' }],
    ['unknown type', { type: 'TILAK' }],
    ['unknown field', { coverImageObjectKey: 'x' }],
  ])('rejects %s with 400', async (_label, overrides) => {
    const owner = await signUpUserWithWedding();
    const response = await owner.agent
      .post(`/api/v1/weddings/${owner.weddingId}/events`)
      .send(validEvent(overrides))
      .expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  // BUG: createEventSchema (events.validation.ts) has no startsAt < endsAt refinement, so a ceremony ending two hours
  // before it starts is stored (201). Expected: 400 VALIDATION_ERROR on endsAt.
  it.fails('rejects a ceremony that ends before it starts', async () => {
    const owner = await signUpUserWithWedding();
    await owner.agent
      .post(`/api/v1/weddings/${owner.weddingId}/events`)
      .send(validEvent({ startsAt: '2026-12-11T20:00:00Z', endsAt: '2026-12-11T18:00:00Z' }))
      .expect(400);
  });
});

describe('PATCH /api/v1/weddings/:weddingId/events/:eventId', () => {
  it('updates only the supplied fields and clears fields sent as null', async () => {
    const owner = await signUpUserWithWedding();
    const eventId = await createEvent(owner, { description: 'Dance', address: 'Jaipur' });

    const response = await owner.agent
      .patch(`/api/v1/weddings/${owner.weddingId}/events/${eventId}`)
      .send({ name: 'Grand Sangeet', description: null })
      .expect(200);

    expect(response.body.data).toMatchObject({ name: 'Grand Sangeet', address: 'Jaipur', venueName: 'Lawn' });
    expect(response.body.data).not.toHaveProperty('description');
  });

  it('an empty patch is a harmless no-op, not a 500', async () => {
    const owner = await signUpUserWithWedding();
    const eventId = await createEvent(owner);
    const response = await owner.agent.patch(`/api/v1/weddings/${owner.weddingId}/events/${eventId}`).send({}).expect(200);
    expect(response.body.data.name).toBe('Sangeet Night');
  });

  it('cannot reach another wedding’s ceremony through your own wedding path (404, untouched)', async () => {
    const owner = await signUpUserWithWedding();
    const attacker = await signUpUserWithWedding();
    const eventId = await createEvent(owner);

    await attacker.agent
      .patch(`/api/v1/weddings/${attacker.weddingId}/events/${eventId}`)
      .send({ name: 'Hacked' })
      .expect(404);
    await attacker.agent.patch(`/api/v1/weddings/${owner.weddingId}/events/${eventId}`).send({ name: 'Hacked' }).expect(403);

    expect((await EventModel.findById(eventId).lean())!.name).toBe('Sangeet Night');
  });

  it.each(['not-an-id', '000000000000000000000000'])('returns 404 for an unknown event id (%s)', async (eventId) => {
    const owner = await signUpUserWithWedding();
    await owner.agent.patch(`/api/v1/weddings/${owner.weddingId}/events/${eventId}`).send({ name: 'X' }).expect(404);
  });

  it('cannot edit an archived ceremony', async () => {
    const owner = await signUpUserWithWedding();
    const eventId = await createEvent(owner);
    await owner.agent.post(`/api/v1/weddings/${owner.weddingId}/events/${eventId}/archive`).expect(204);
    await owner.agent.patch(`/api/v1/weddings/${owner.weddingId}/events/${eventId}`).send({ name: 'X' }).expect(404);
  });

  it('rejects clearing the required name or start time', async () => {
    const owner = await signUpUserWithWedding();
    const eventId = await createEvent(owner);
    await owner.agent.patch(`/api/v1/weddings/${owner.weddingId}/events/${eventId}`).send({ name: null }).expect(400);
    await owner.agent.patch(`/api/v1/weddings/${owner.weddingId}/events/${eventId}`).send({ startsAt: null }).expect(400);
  });

  // BUG: updateEventSchema lets startsAt move past the stored endsAt (200), and has no endsAt field at all, so a wrong
  // end time can never be corrected or cleared. Expected: 400 when the result would end before it starts, and
  // endsAt editable/clearable like the other optional fields.
  it.fails('rejects moving a ceremony’s start after its existing end time', async () => {
    const owner = await signUpUserWithWedding();
    const eventId = await createEvent(owner, { startsAt: '2026-12-11T18:00:00Z', endsAt: '2026-12-11T22:00:00Z' });
    await owner.agent
      .patch(`/api/v1/weddings/${owner.weddingId}/events/${eventId}`)
      .send({ startsAt: '2026-12-12T09:00:00Z' })
      .expect(400);
  });
});

describe('POST /api/v1/weddings/:weddingId/events/:eventId/archive', () => {
  it('archives the ceremony so it drops out of the list; a second archive is 404', async () => {
    const owner = await signUpUserWithWedding();
    const keepId = await createEvent(owner, { name: 'Haldi' });
    const archiveId = await createEvent(owner, { name: 'Mehendi' });

    await owner.agent.post(`/api/v1/weddings/${owner.weddingId}/events/${archiveId}/archive`).expect(204);
    const list = await owner.agent.get(`/api/v1/weddings/${owner.weddingId}/events`).expect(200);
    expect(list.body.data.map((event: { id: string }) => event.id)).toEqual([keepId]);

    await owner.agent.post(`/api/v1/weddings/${owner.weddingId}/events/${archiveId}/archive`).expect(404);
    // Archive is a soft delete: the record is kept for history.
    expect(await EventModel.countDocuments({ _id: archiveId })).toBe(1);
  });

  it('forbids non-members and cross-wedding archive attempts', async () => {
    const owner = await signUpUserWithWedding();
    const attacker = await signUpUserWithWedding();
    const outsider = await signUpUser();
    const eventId = await createEvent(owner);

    await outsider.agent.post(`/api/v1/weddings/${owner.weddingId}/events/${eventId}/archive`).expect(403);
    await attacker.agent.post(`/api/v1/weddings/${attacker.weddingId}/events/${eventId}/archive`).expect(404);
    expect((await EventModel.findById(eventId).lean())!.archivedAt).toBeUndefined();
  });
});
