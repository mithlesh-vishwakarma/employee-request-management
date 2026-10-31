import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import app from './app.js';
import { connectDB } from './config/db.js';
import { startReminderJob } from './jobs/reminderCron.js';
import User from './models/User.js';
import { seedDatabase } from './utils/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is brand new and has 0 users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] No existing users found. Seeding initial demo data...');
      await seedDatabase();
    }

    // Start background 24-hour reminder scheduler
    startReminderJob();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Employee Request Management Backend Server Active`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🛡️  Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`====================================================`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error('[Process] Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      console.error('[Process] Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('[Server] Critical startup failure:', err);
    process.exit(1);
  }
};

startServer();

