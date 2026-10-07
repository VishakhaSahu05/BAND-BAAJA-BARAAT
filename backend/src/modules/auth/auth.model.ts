import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export interface UserAttributes {
  name: string;
  email: string;
  emailNormalized: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<UserAttributes>;

const userSchema = new Schema<UserAttributes>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    emailNormalized: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const UserModel: Model<UserAttributes> = model<UserAttributes>('User', userSchema);

export interface SessionAttributes {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt?: Date;
}

export type SessionDocument = HydratedDocument<SessionAttributes>;

const sessionSchema = new Schema<SessionAttributes>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true, default: () => new Date() },
  lastUsedAt: { type: Date },
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel: Model<SessionAttributes> = model<SessionAttributes>('Session', sessionSchema);

export interface PasswordResetTokenAttributes {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export type PasswordResetTokenDocument = HydratedDocument<PasswordResetTokenAttributes>;

const passwordResetTokenSchema = new Schema<PasswordResetTokenAttributes>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date },
  createdAt: { type: Date, required: true, default: () => new Date() },
});

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetTokenModel: Model<PasswordResetTokenAttributes> = model<PasswordResetTokenAttributes>(
  'PasswordResetToken',
  passwordResetTokenSchema,
);
