import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  clearTestDatabase,
  signUpUser,
  signUpUserWithWedding,
  startTestDatabase,
  stopTestDatabase,
  validWeddingInput,
} from '../../test/database.ts';
import { WeddingModel } from './weddings.model.ts';

beforeAll(startTestDatabase);
afterAll(stopTestDatabase);
beforeEach(clearTestDatabase);

describe('PATCH /api/v1/weddings/:weddingId', () => {
  it('updates only the supplied fields', async () => {
    const owner = await signUpUserWithWedding({ description: 'Royal', budgetPaise: 100 });
    const response = await owner.agent
      .patch(`/api/v1/weddings/${owner.weddingId}`)
      .send({ groomName: 'Kabir Singh', muhuratTimeLabel: '7:42 PM', venueOpsContact: { name: 'Ravi', phoneNumber: '+91 98765-43210' } })
      .expect(200);

    expect(response.body.data).toMatchObject({
      brideName: 'Ananya',
      groomName: 'Kabir Singh',
      description: 'Royal',
      budgetPaise: 100,
      muhuratTimeLabel: '7:42 PM',
      venueOpsContact: { name: 'Ravi', phoneNumber: '+91 98765-43210' },
    });
  });

  it('clears optional fields sent as null or empty string, and keeps a 0 budget (falsy but valid)', async () => {
    const owner = await signUpUserWithWedding({ description: 'Royal', hashtag: '#AnKa', budgetPaise: 500 });
    await owner.agent
      .patch(`/api/v1/weddings/${owner.weddingId}`)
      .send({ description: null, hashtag: '', budgetPaise: 0 })
      .expect(200);

    const stored = await WeddingModel.findById(owner.weddingId).lean();
    expect(stored!.description).toBeUndefined();
    expect(stored!.hashtag).toBeUndefined();
    expect(stored!.budgetPaise).toBe(0);
  });

  it('does not change the public website slug when the couple’s names change', async () => {
    const owner = await signUpUserWithWedding();
    const response = await owner.agent.patch(`/api/v1/weddings/${owner.weddingId}`).send({ brideName: 'Riya' }).expect(200);
    expect(response.body.data.websiteSlug).toBe('ananya-kabir');
  });

  it('an empty patch is a harmless no-op, not a 500', async () => {
    const owner = await signUpUserWithWedding();
    const response = await owner.agent.patch(`/api/v1/weddings/${owner.weddingId}`).send({}).expect(200);
    expect(response.body.data.brideName).toBe('Ananya');
  });

  it.each([
    ['required name cleared', { brideName: null }],
    ['required date cleared', { weddingDate: null }],
    ['boolean date', { weddingDate: false }],
    ['unknown time zone', { timeZone: 'Mars/Olympus_Mons' }],
    ['protected field: website', { website: { slug: 'hijack', isPublished: true } }],
    ['protected field: gallery', { gallery: { tokenHash: 'x' } }],
    ['protected field: createdByUserId', { createdByUserId: '507f1f77bcf86cd799439011' }],
    ['operator injection', { $set: { 'website.isPublished': true } }],
    ['phone number with letters', { venueOpsContact: { name: 'Ravi', phoneNumber: 'call me maybe' } }],
    ['partial location', { location: { city: 'Udaipur' } }],
  ])('rejects %s with 400 and leaves the wedding untouched', async (_label, body) => {
    const owner = await signUpUserWithWedding();
    const before = await WeddingModel.findById(owner.weddingId).lean();
    await owner.agent.patch(`/api/v1/weddings/${owner.weddingId}`).send(body).expect(400);
    const after = await WeddingModel.findById(owner.weddingId).lean();
    expect(after!.updatedAt).toEqual(before!.updatedAt);
  });

  it('accepts a valid IANA time zone', async () => {
    const owner = await signUpUserWithWedding();
    await owner.agent.patch(`/api/v1/weddings/${owner.weddingId}`).send({ timeZone: 'America/New_York' }).expect(200);
  });

  it('forbids editing another couple’s wedding', async () => {
    const owner = await signUpUserWithWedding();
    const attacker = await signUpUserWithWedding();
    const outsider = await signUpUser();

    await attacker.agent.patch(`/api/v1/weddings/${owner.weddingId}`).send({ brideName: 'Hacked' }).expect(403);
    await outsider.agent.patch(`/api/v1/weddings/${owner.weddingId}`).send({ brideName: 'Hacked' }).expect(403);
    expect((await WeddingModel.findById(owner.weddingId).lean())!.brideName).toBe('Ananya');
  });

  it('cannot edit a soft-deleted wedding', async () => {
    const owner = await signUpUserWithWedding();
    await WeddingModel.updateOne({ _id: owner.weddingId }, { $set: { deletedAt: new Date() } });
    await owner.agent.patch(`/api/v1/weddings/${owner.weddingId}`).send({ brideName: 'Riya' }).expect(404);
  });
});

describe('strict date and time zone validation on create', () => {
  it.each([
    ['null date', { weddingDate: null }],
    ['impossible date', { weddingDate: '2026-02-30' }],
    ['unknown time zone', { timeZone: 'Asia/Atlantis' }],
  ])('rejects %s with 400', async (_label, overrides) => {
    const user = await signUpUser();
    await user.agent.post('/api/v1/weddings').send(validWeddingInput(overrides)).expect(400);
  });
});
