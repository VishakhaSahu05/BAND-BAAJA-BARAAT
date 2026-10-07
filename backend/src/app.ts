import cookieParser from 'cookie-parser';
import express from 'express';
import { errorHandler } from './middleware/error-handler.ts';
import { requestIdMiddleware } from './middleware/request-id.ts';
import { authRouter } from './modules/auth/auth.routes.ts';
import { weddingsRouter } from './modules/weddings/weddings.routes.ts';
import { ApiError } from './utils/api-error.ts';

const app = express();

app.use(requestIdMiddleware);
app.use(express.json());
app.use(cookieParser());

app.get('/api/v1/health', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'Band Baaja Baaraat API is running',
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/weddings', weddingsRouter);

app.use((_request, _response, next) => {
  next(new ApiError('NOT_FOUND', 'Route not found.'));
});

app.use(errorHandler);

export default app;
