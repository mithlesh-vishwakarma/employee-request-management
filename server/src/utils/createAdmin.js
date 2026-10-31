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
import { ROLES } from '../constants/index.js';

export const createAdminUser = async (customEmail, customPassword, customName) => {
  const email = (customEmail || 'admin@enterprise.com').trim().toLowerCase();
  const password = customPassword || 'Password123!';
  const name = customName || 'System Administrator';

  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  console.log(`[Admin Creator] Connected to Atlas database: "${mongoose.connection.name}"`);

  // Check if admin already exists
  let existing = await User.findOne({ email }).select('+password');

  if (existing) {
    console.log(`[Admin Creator] User "${email}" already exists. Updating password and ensuring admin role...`);
    existing.password = password; // Will be hashed by pre('save') hook
    existing.role = ROLES.ADMIN;
    existing.isActive = true;
    await existing.save();

    console.log('\n✅ Admin account updated successfully!');
    console.log(`   Name:     ${existing.name}`);
    console.log(`   Email:    ${existing.email}`);
    console.log(`   Role:     ${existing.role}`);
    console.log(`   Password: ${password}`);
  } else {
    console.log(`[Admin Creator] Creating new admin account for "${email}"...`);
    const newAdmin = await User.create({
      name,
      email,
      password, // Automatically hashed with bcrypt via Mongoose pre('save') hook
      role: ROLES.ADMIN,
      department: 'Administration',
      employeeId: 'ADM-001',
      isActive: true,
    });

    console.log('\n✅ Admin account created successfully in MongoDB Atlas!');
    console.log(`   ID:       ${newAdmin._id}`);
    console.log(`   Name:     ${newAdmin.name}`);
    console.log(`   Email:    ${newAdmin.email}`);
    console.log(`   Role:     ${newAdmin.role}`);
    console.log(`   Password: ${password}`);
  }

  await mongoose.connection.close();
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  const name = args[2];

  createAdminUser(email, password, name)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Admin Creator] Error:', err.message);
      process.exit(1);
    });
}

