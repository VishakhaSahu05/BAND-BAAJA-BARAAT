import type { NextFunction, Request, Response } from 'express';
import { requireUserBySessionToken } from '../modules/auth/auth.service.ts';
import { SESSION_COOKIE_NAME } from '../modules/auth/auth.types.ts';
import type { PublicUser } from '../modules/auth/auth.types.ts';

declare module 'express-serve-static-core' {
  interface Request {
    user?: PublicUser;
  }
}

export async function requireAuth(request: Request, _response: Response, next: NextFunction): Promise<void> {
  try {
    const sessionToken: unknown = request.cookies?.[SESSION_COOKIE_NAME];
    request.user = await requireUserBySessionToken(typeof sessionToken === 'string' ? sessionToken : undefined);
    next();
  } catch (error) {
    next(error);
  }
}
