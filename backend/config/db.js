const mongoose = require('mongoose');

/** Log connection target without password (for debugging Atlas vs local). */
const redactMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '(MONGO_URI missing)';
  return uri.replace(/:([^@/]+)@/, ':***@');
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MongoDB connection error: MONGO_URI is not set');
      return;
    }

    console.log(`MONGO_URI in use: ${redactMongoUri(process.env.MONGO_URI)}`);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
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

module.exports = connectDB;
