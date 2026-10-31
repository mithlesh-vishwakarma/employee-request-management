import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Successfully connected to MongoDB at: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[DB] Local MongoDB connection failed at ${uri} (${err.message}).`);

    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[DB] Launching development in-memory MongoDB server fallback...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[DB] Connected to In-Memory MongoDB at: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('[DB] Failed to start in-memory MongoDB:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('[DB] Production MongoDB connection error:', err);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('[DB] Error during disconnection:', err.message);
  }
};

