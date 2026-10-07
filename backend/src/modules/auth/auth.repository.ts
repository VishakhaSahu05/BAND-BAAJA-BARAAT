import {
  PasswordResetTokenModel,
  SessionModel,
  UserModel,
  type PasswordResetTokenDocument,
  type SessionDocument,
  type UserDocument,
} from './auth.model.ts';

export async function createUser(input: {
  name: string;
  email: string;
  emailNormalized: string;
  passwordHash: string;
}): Promise<UserDocument> {
  return UserModel.create(input);
}

export async function findUserByNormalizedEmail(emailNormalized: string): Promise<UserDocument | null> {
  return UserModel.findOne({ emailNormalized });
}

export async function findUserById(userId: string): Promise<UserDocument | null> {
  return UserModel.findById(userId);
}

export async function updateUserPasswordHash(userId: string, passwordHash: string): Promise<void> {
  await UserModel.updateOne({ _id: userId }, { $set: { passwordHash } });
}

export async function createSession(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<SessionDocument> {
  return SessionModel.create(input);
}

export async function findSessionByTokenHash(tokenHash: string): Promise<SessionDocument | null> {
  return SessionModel.findOne({ tokenHash });
}

export async function touchSession(sessionId: string): Promise<void> {
  await SessionModel.updateOne({ _id: sessionId }, { $set: { lastUsedAt: new Date() } });
}

export async function deleteSessionByTokenHash(tokenHash: string): Promise<void> {
  await SessionModel.deleteOne({ tokenHash });
}

export async function deleteSessionsForUser(userId: string): Promise<void> {
  await SessionModel.deleteMany({ userId });
}

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<PasswordResetTokenDocument> {
  return PasswordResetTokenModel.create(input);
}

/** Atomically marks an unused, unexpired token as used and returns it; null if none qualifies. */
export async function claimPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenDocument | null> {
  const now = new Date();
  return PasswordResetTokenModel.findOneAndUpdate(
    { tokenHash, usedAt: null, expiresAt: { $gt: now } },
    { $set: { usedAt: now } },
    { returnDocument: 'after' },
  );
}
