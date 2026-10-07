import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  clearTestDatabase,
  signUpUserWithWedding,
  startTestDatabase,
  stopTestDatabase,
} from '../../test/database.ts';
import { EventModel } from '../events/events.model.ts';
import { ExpenseModel } from '../expenses/expenses.model.ts';
import { GuestModel, type RsvpStatus } from '../guests/guests.model.ts';
import { TaskModel } from '../tasks/tasks.model.ts';
import { VendorModel } from '../vendors/vendors.model.ts';
import { WeddingMembershipModel } from '../weddings/weddings.model.ts';

beforeAll(startTestDatabase);
afterAll(stopTestDatabase);
beforeEach(clearTestDatabase);

interface Metric {
  id: string;
  value: string;
  progressPercent: number;
}

/** Seeds one wedding's worth of planning data. `scale` lets two tenants hold clearly different numbers. */
async function seedPlanningData(weddingIdString: string, scale: number) {
  const weddingId = new mongoose.Types.ObjectId(weddingIdString);
  const membership = await WeddingMembershipModel.findOne({ weddingId }).lean();
  const guest = (rsvpStatus: RsvpStatus, maxGuests: number, attendingCount?: number) => ({
    weddingId,
    name: `Guest ${randomUUID()}`,
    maxGuests,
    rsvpStatus,
    attendingCount,
    invitationToken: randomUUID(),
  });

  await GuestModel.create([
    guest('ATTENDING', 4, 3 * scale),
    guest('ATTENDING', 2, 2 * scale),
    guest('NOT_ATTENDING', 2, 0),
    guest('PENDING', 5),
  ]);
  await VendorModel.create([
    { weddingId, name: 'Caterer', category: 'Food', isContractSigned: true },
    { weddingId, name: 'Florist', category: 'Decor', isContractSigned: scale > 1 },
    { weddingId, name: 'Band', category: 'Music', isContractSigned: false },
    { weddingId, name: 'Archived DJ', category: 'Music', isContractSigned: true, archivedAt: new Date() },
  ]);
  await ExpenseModel.create([
    { weddingId, title: 'Advance', amountPaise: 1_00_000_00 * scale, category: 'Venue', createdByMembershipId: membership!._id },
    { weddingId, title: 'Flowers', amountPaise: 50_000_00 * scale, category: 'Decor', createdByMembershipId: membership!._id },
    { weddingId, title: 'USD deposit', amountPaise: 99_999_99, currency: 'USD', category: 'Misc', createdByMembershipId: membership!._id },
  ]);
}

async function getDashboard(user: Awaited<ReturnType<typeof signUpUserWithWedding>>) {
  const response = await user.agent.get(`/api/v1/weddings/${user.weddingId}/dashboard`).expect(200);
  const metrics = Object.fromEntries(
    (response.body.data.metrics as Metric[]).map((metric) => [metric.id, metric]),
  ) as Record<string, Metric>;
  return { data: response.body.data, metrics };
}

describe('GET /api/v1/weddings/:weddingId/dashboard', () => {
  it('returns a sane, empty dashboard for a brand-new wedding (no NaN, no divide-by-zero)', async () => {
    const user = await signUpUserWithWedding();
    const { data, metrics } = await getDashboard(user);

    expect(JSON.stringify(data)).not.toMatch(/NaN|Infinity|undefined/);
    for (const metric of Object.values(metrics)) {
      expect(metric.progressPercent).toBe(0);
    }
    expect(metrics['guest-rsvps']!.value).toBe('0');
    expect(metrics['vendor-contracts']!.value).toBe('0 / 0');
    expect(data.ceremonies).toEqual([]);
    expect(data.criticalTasks).toEqual([]);
  });

  it('aggregates only the caller’s wedding, even when another tenant has more data', async () => {
    const alice = await signUpUserWithWedding({ budgetPaise: 10_00_000_00 });
    const bob = await signUpUserWithWedding({ brideName: 'Bina' });
    await seedPlanningData(alice.weddingId, 1);
    await seedPlanningData(bob.weddingId, 10);

    const { metrics } = await getDashboard(alice);

    // Attending headcount sums attendingCount of ATTENDING guests only: 3 + 2.
    expect(metrics['guest-rsvps']!.value).toBe('5');
    // Archived vendors excluded; Florist unsigned for scale 1.
    expect(metrics['vendor-contracts']!.value).toBe('1 / 3');
    // INR only: ₹1,00,000 + ₹50,000 = ₹1.5L. The USD expense is not added in.
    expect(metrics['ceremony-budget']!.value).toBe('₹1.5L');
    expect(metrics['ceremony-budget']!.progressPercent).toBe(15);
  });

  it('lists at most 5 open tasks, soonest first, undated last, never completed ones', async () => {
    const user = await signUpUserWithWedding();
    const weddingId = new mongoose.Types.ObjectId(user.weddingId);
    await TaskModel.create([
      { weddingId, title: 'Undated', status: 'PENDING' },
      { weddingId, title: 'Done', dueDate: new Date('2026-01-01'), status: 'COMPLETED' },
      { weddingId, title: 'Dec 3', dueDate: new Date('2026-12-03') },
      { weddingId, title: 'Dec 1', dueDate: new Date('2026-12-01'), status: 'IN_PROGRESS' },
      { weddingId, title: 'Dec 2', dueDate: new Date('2026-12-02') },
      { weddingId, title: 'Dec 4', dueDate: new Date('2026-12-04') },
      { weddingId, title: 'Dec 5', dueDate: new Date('2026-12-05') },
    ]);
    // Another tenant's urgent task must not appear.
    const other = await signUpUserWithWedding();
    await TaskModel.create({ weddingId: other.weddingId, title: 'Other tenant', dueDate: new Date('2025-01-01') });

    const { data } = await getDashboard(user);
    expect(data.criticalTasks.map((task: { title: string }) => task.title)).toEqual([
      'Dec 1',
      'Dec 2',
      'Dec 3',
      'Dec 4',
      'Dec 5',
    ]);
  });

  it('counts ritual milestones from active ceremonies only and includes the owner in the family circle', async () => {
    const user = await signUpUserWithWedding({ rituals: [{ name: 'Haldi', type: 'HALDI' }, { name: 'Sangeet', type: 'SANGEET' }] });
    await EventModel.updateOne({ name: 'Haldi' }, { $set: { venueName: 'Lawn' } });
    await EventModel.create({ weddingId: user.weddingId, name: 'Cancelled', startsAt: new Date(), archivedAt: new Date() });

    const { data, metrics } = await getDashboard(user);
    expect(metrics['ritual-milestones']!.value).toBe('1 of 2');
    expect(metrics['ritual-milestones']!.progressPercent).toBe(50);
    expect(data.ceremonies.map((ceremony: { name: string }) => ceremony.name).sort()).toEqual(['Haldi', 'Sangeet']);
    expect(data.familyCircle).toHaveLength(1);
    expect(data.familyCircle[0].name).toMatch(/^Test User/);
  });

  it('caps progress at 100% when spending exceeds the budget', async () => {
    const user = await signUpUserWithWedding({ budgetPaise: 1_000_00 });
    await seedPlanningData(user.weddingId, 1);
    const { metrics } = await getDashboard(user);
    expect(metrics['ceremony-budget']!.progressPercent).toBe(100);
  });
});
