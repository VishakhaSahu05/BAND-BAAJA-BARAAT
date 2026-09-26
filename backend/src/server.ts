import app from './app.ts';
import { env } from './config/env.ts';
import { connectToDatabase, disconnectFromDatabase } from './db/connection.ts';

const server = app.listen(env.PORT, () => {
  console.info(`Band Baaja Baaraat API listening on port ${env.PORT}`);
});

let shutdownPromise: Promise<void> | undefined;

async function shutdown(signal: string): Promise<void> {
  if (shutdownPromise) {
    return shutdownPromise;
  }

  shutdownPromise = (async () => {
    console.info(`${signal} received; shutting down the API.`);
    let shutdownFailed = false;

    try {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    } catch {
      shutdownFailed = true;
    }

    try {
      await disconnectFromDatabase();
    } catch {
      shutdownFailed = true;
    }

    if (shutdownFailed) {
      process.exitCode = 1;
      console.error('API shutdown failed.');
      return;
    }

    console.info('API shutdown complete.');
  })();

  return shutdownPromise;
}

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

if (env.MONGODB_URI) {
  void connectToDatabase().then(
    () => console.info('MongoDB connection ready.'),
    () => {
      process.exitCode = 1;
      console.error('MongoDB connection failed. Check MONGODB_URI and database availability.');
      void shutdown('MongoDB startup failure');
    },
  );
}
