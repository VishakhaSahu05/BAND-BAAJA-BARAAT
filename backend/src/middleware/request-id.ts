import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

const requestIdPattern = /^[A-Za-z0-9._-]{1,128}$/;

export const requestIdMiddleware: RequestHandler = (request, response, next) => {
  const suppliedRequestId = request.get('x-request-id')?.trim();
  const requestId = suppliedRequestId && requestIdPattern.test(suppliedRequestId)
    ? suppliedRequestId
    : `req_${randomUUID()}`;

  response.locals.requestId = requestId;
  response.setHeader('X-Request-Id', requestId);
  next();
};
