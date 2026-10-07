import type { Request, Response } from 'express';
import { env } from '../../config/env.ts';
import * as authService from './auth.service.ts';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from './auth.validation.ts';
import { SESSION_COOKIE_NAME } from './auth.types.ts';

function setSessionCookie(response: Response, sessionToken: string, expiresAt: Date): void {
  response.cookie(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

function clearSessionCookie(response: Response): void {
  response.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
}

export async function signup(request: Request, response: Response): Promise<void> {
  const input = signupSchema.parse(request.body);
  const result = await authService.signup(input);

  setSessionCookie(response, result.sessionToken, result.sessionExpiresAt);
  response.status(201).json({ data: result.user });
}

export async function login(request: Request, response: Response): Promise<void> {
  const input = loginSchema.parse(request.body);
  const result = await authService.login(input);

  setSessionCookie(response, result.sessionToken, result.sessionExpiresAt);
  response.status(200).json({ data: result.user });
}

export async function logout(request: Request, response: Response): Promise<void> {
  const sessionToken: unknown = request.cookies?.[SESSION_COOKIE_NAME];

  if (typeof sessionToken === 'string') {
    await authService.logout(sessionToken);
  }

  clearSessionCookie(response);
  response.status(204).send();
}

export function me(request: Request, response: Response): void {
  response.status(200).json({ data: request.user });
}

export async function forgotPassword(request: Request, response: Response): Promise<void> {
  const input = forgotPasswordSchema.parse(request.body);
  await authService.forgotPassword(input);

  response.status(202).json({ data: { message: 'If that email is registered, a reset link has been sent.' } });
}

export async function resetPassword(request: Request, response: Response): Promise<void> {
  const input = resetPasswordSchema.parse(request.body);
  await authService.resetPassword(input);

  response.status(200).json({ data: { message: 'Password updated. Please log in again.' } });
}
