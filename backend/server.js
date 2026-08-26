import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Start Server
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 [Express Backend] Server running on http://localhost:${PORT}`);
    console.log(`🔗 [Database] Target MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/Ecommerce'}`);
  });
});
