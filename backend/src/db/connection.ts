import mongoose from 'mongoose';
import { env } from '../config/env.ts';

let connectionPromise: Promise<typeof mongoose> | undefined;

export async function connectToDatabase(
  uri: string | undefined = env.MONGODB_URI,
): Promise<typeof mongoose | null> {
  if (!uri) {
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).catch((error: unknown) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (connectionPromise) {
    try {
      await connectionPromise;
    } catch {
      // The caller handles connection failures; shutdown still closes any open connection.
    }
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  connectionPromise = undefined;
}
