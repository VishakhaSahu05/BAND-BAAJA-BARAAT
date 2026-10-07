import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface TaskAttributes {
  weddingId: Types.ObjectId;
  title: string;
  description?: string;
  assignedMembershipId?: Types.ObjectId;
  eventId?: Types.ObjectId;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskDocument = HydratedDocument<TaskAttributes>;

const taskSchema = new Schema<TaskAttributes>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: 'Wedding', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedMembershipId: { type: Schema.Types.ObjectId, ref: 'WeddingMembership' },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    dueDate: { type: Date },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true, default: 'MEDIUM' },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], required: true, default: 'PENDING' },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

taskSchema.index({ weddingId: 1, status: 1 });
taskSchema.index({ weddingId: 1, dueDate: 1 });
taskSchema.index({ weddingId: 1, assignedMembershipId: 1, status: 1 });
taskSchema.index({ weddingId: 1, eventId: 1 });

export const TaskModel: Model<TaskAttributes> = model<TaskAttributes>('Task', taskSchema);
