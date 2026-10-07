import { randomBytes, createHash } from 'node:crypto';
import bcrypt from 'bcrypt';
import { ApiError } from '../../utils/api-error.ts';
import { duplicateKeyFields } from '../../utils/mongo-errors.ts';
import * as authRepository from './auth.repository.ts';
import { PASSWORD_RESET_TTL_MS, SESSION_TTL_MS, toPublicUser, type PublicUser } from './auth.types.ts';
import type { ForgotPasswordInput, LoginInput, ResetPasswordInput, SignupInput } from './auth.validation.ts';

const BCRYPT_SALT_ROUNDS = 12;

function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

function generateRawToken(): string {
  return randomBytes(32).toString('hex');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface AuthResult {
  user: PublicUser;
  sessionToken: string;
  sessionExpiresAt: Date;
}

async function issueSession(userId: string): Promise<{ sessionToken: string; sessionExpiresAt: Date }> {
  const sessionToken = generateRawToken();
  const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await authRepository.createSession({
    userId,
    tokenHash: hashToken(sessionToken),
    expiresAt: sessionExpiresAt,
  });

  return { sessionToken, sessionExpiresAt };
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  const emailNormalized = normalizeEmail(input.email);

  const existingUser = await authRepository.findUserByNormalizedEmail(emailNormalized);
  if (existingUser) {
    throw new ApiError('CONFLICT', 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  let user;
  try {
    user = await authRepository.createUser({
      name: input.name,
      email: input.email.trim(),
      emailNormalized,
      passwordHash,
    });
  } catch (error) {
    if (duplicateKeyFields(error)?.includes('emailNormalized')) {
      throw new ApiError('CONFLICT', 'An account with this email already exists.');
    }
    throw error;
  }

  const { sessionToken, sessionExpiresAt } = await issueSession(user._id.toString());

  return { user: toPublicUser(user), sessionToken, sessionExpiresAt };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const emailNormalized = normalizeEmail(input.email);
  const user = await authRepository.findUserByNormalizedEmail(emailNormalized);

  if (!user) {
    throw new ApiError('UNAUTHENTICATED', 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError('UNAUTHENTICATED', 'Invalid email or password.');
  }

  const { sessionToken, sessionExpiresAt } = await issueSession(user._id.toString());

  return { user: toPublicUser(user), sessionToken, sessionExpiresAt };
}

export async function logout(sessionToken: string): Promise<void> {
  await authRepository.deleteSessionByTokenHash(hashToken(sessionToken));
}

export async function getUserBySessionToken(sessionToken: string): Promise<PublicUser | null> {
  const session = await authRepository.findSessionByTokenHash(hashToken(sessionToken));

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  const user = await authRepository.findUserById(session.userId.toString());
  if (!user) {
    return null;
  }

  authRepository.touchSession(session._id.toString()).catch(() => {
    // Best-effort activity tracking; a failed update must not affect the caller's request.
  });

  return toPublicUser(user);
}

export async function requireUserBySessionToken(sessionToken: string | undefined): Promise<PublicUser> {
  if (!sessionToken) {
    throw new ApiError('UNAUTHENTICATED', 'Authentication required.');
  }

  const user = await getUserBySessionToken(sessionToken);
  if (!user) {
    throw new ApiError('UNAUTHENTICATED', 'Authentication required.');
  }

  return user;
}

/**
 * Always succeeds from the caller's perspective, even for an unknown email,
 * so the endpoint cannot be used to enumerate registered accounts.
 */
export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  const emailNormalized = normalizeEmail(input.email);
  const user = await authRepository.findUserByNormalizedEmail(emailNormalized);

  if (!user) {
    return;
  }

  const rawToken = generateRawToken();
  await authRepository.createPasswordResetToken({
    userId: user._id.toString(),
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
  });

  // Email delivery goes through the Resend integration once it exists; not part of this slice.
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  // Hash first so the token is only claimed once the new password is ready to write.
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  // Claiming is a single atomic update, so two concurrent requests can't both redeem the token.
  const resetToken = await authRepository.claimPasswordResetToken(hashToken(input.token));
  if (!resetToken) {
    throw new ApiError('UNAUTHENTICATED', 'This password reset link is invalid or has expired.');
  }

  await authRepository.updateUserPasswordHash(resetToken.userId.toString(), passwordHash);
  await authRepository.deleteSessionsForUser(resetToken.userId.toString());
}
