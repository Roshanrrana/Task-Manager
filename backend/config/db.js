const mongoose = require('mongoose');

/** Log connection target without password (for debugging Atlas vs local). */
const redactMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '(MONGO_URI missing)';
  return uri.replace(/:([^@/]+)@/, ':***@');
};

const connectDB = async () => {
  try {
    console.log(`MONGO_URI in use: ${redactMongoUri(process.env.MONGO_URI)}`);

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `MongoDB connected: ${conn.connection.host} (database: ${conn.connection.name})`
    );
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
