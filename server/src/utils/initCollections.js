import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // ignore
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../models/User.js';
import Request from '../models/Request.js';
import RequestComment from '../models/RequestComment.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import ReminderLog from '../models/ReminderLog.js';

export const createCollectionsOnly = async () => {
  const uri = process.env.MONGODB_URI;
  console.log(`[Init] Connecting to MongoDB Atlas: ${uri.split('@')[1] || uri}...`);

  await mongoose.connect(uri);
  console.log(`[Init] Connected to database: "${mongoose.connection.name}"`);

  const models = [
    { name: 'users', model: User },
    { name: 'requests', model: Request },
    { name: 'requestcomments', model: RequestComment },
    { name: 'notifications', model: Notification },
    { name: 'activitylogs', model: ActivityLog },
    { name: 'reminderlogs', model: ReminderLog },
  ];

  console.log('[Init] Ensuring collections and indexes in MongoDB Atlas...');

  for (const { name, model } of models) {
    try {
      await model.createCollection();
      await model.syncIndexes();
      console.log(`  ✓ Collection created and indexed: "${name}"`);
    } catch (err) {
      console.warn(`  - Note on "${name}":`, err.message);
    }
  }

  // List existing collections in the database
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\n[Init] Active Collections in your MongoDB Atlas database:');
  collections.forEach((col) => console.log(`  📁 ${col.name}`));

  await mongoose.connection.close();
  console.log('\n[Init] Completed successfully. Database connection closed.');
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createCollectionsOnly()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Init] Error creating collections:', err.message);
      process.exit(1);
    });
}
