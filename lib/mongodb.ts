import mongoose from 'mongoose';

type MongooseConnection = typeof mongoose | null;
type MongoosePromise = Promise<typeof mongoose> | null;

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: {
    conn: MongooseConnection;
    promise: MongoosePromise;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mavjibha-bachat-mandal';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const cached = globalThis.__mongooseCache || (globalThis.__mongooseCache = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
