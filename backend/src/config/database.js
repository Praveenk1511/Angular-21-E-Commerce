import mongoose from 'mongoose';

/**
 * Connects to MongoDB database using Mongoose.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Ecommerce';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Failed connection to ${uri}:`, error.message);
    process.exit(1);
  }
}
