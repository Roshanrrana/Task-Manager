const mongoose = require('mongoose');

/** Log connection target without password (for debugging Atlas vs local). */
const redactMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '(MONGO_URI missing)';
  return uri.replace(/:([^@/]+)@/, ':***@');
};

const getMongoUri = () =>
  process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL;

const connectDB = async () => {
  try {
    const mongoUri = getMongoUri();

    if (!mongoUri) {
      console.error('MongoDB connection error: no Mongo connection string found. Set MONGO_URI, MONGODB_URI, or MONGO_URL.');
      return;
    }

    console.log(`Mongo connection string in use: ${redactMongoUri(mongoUri)}`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(
      `MongoDB connected: ${conn.connection.host} (database: ${conn.connection.name})`
    );
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Do not exit — keeps the process alive for load balancers / Railway health checks
    // while you fix MONGO_URI or Atlas network access. API routes will fail until connected.
  }
};

module.exports = { connectDB, getMongoUri };
