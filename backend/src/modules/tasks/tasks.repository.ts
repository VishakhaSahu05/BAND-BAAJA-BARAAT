import { Types } from 'mongoose';
import { TaskModel, type TaskAttributes } from './tasks.model.ts';

export type OpenTask = Pick<TaskAttributes, 'title' | 'dueDate' | 'status'> & { _id: Types.ObjectId };

/** Incomplete tasks soonest-due first; tasks without a due date sort after dated ones. */
export async function findUpcomingIncomplete(weddingId: string, limit: number): Promise<OpenTask[]> {
  return TaskModel.aggregate<OpenTask>([
    { $match: { weddingId: new Types.ObjectId(weddingId), status: { $ne: 'COMPLETED' } } },
    { $addFields: { sortKey: { $ifNull: ['$dueDate', new Date('9999-12-31T00:00:00.000Z')] } } },
    { $sort: { sortKey: 1, createdAt: 1 } },
    { $limit: limit },
    { $project: { title: 1, dueDate: 1, status: 1 } },
  ]);
}
