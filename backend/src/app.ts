import express from 'express';
import { errorHandler } from './middleware/error-handler.ts';
import { requestIdMiddleware } from './middleware/request-id.ts';
import { ApiError } from './utils/api-error.ts';

const app = express();

app.use(requestIdMiddleware);

app.get('/api/v1/health', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'Band Baaja Baaraat API is running',
  });
});

app.use((_request, _response, next) => {
  next(new ApiError('NOT_FOUND', 'Route not found.'));
});

app.use(errorHandler);

export default app;
