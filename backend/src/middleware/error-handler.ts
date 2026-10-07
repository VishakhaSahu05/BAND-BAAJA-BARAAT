import { ZodError } from 'zod';
import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/api-error.ts';

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred.';
  let details: Array<{ field: string; message: string }> = [];

  // express.json() errors carry a `type`; they are client errors, not server faults.
  const bodyParserType =
    typeof error === 'object' && error !== null && 'type' in error && typeof error.type === 'string'
      ? error.type
      : undefined;

  if (bodyParserType === 'entity.parse.failed') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request body is not valid JSON.';
  } else if (bodyParserType === 'entity.too.large') {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body is too large.';
  } else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed.';
    details = error.issues.map((issue) => ({
      field: issue.path.join('.') || '$',
      message: issue.message,
    }));
  } else {
    console.error(`[${response.locals.requestId}]`, error);
  }

  response.status(statusCode).json({
    error: {
      code,
      message,
      details,
      requestId: response.locals.requestId,
    },
  });
};
