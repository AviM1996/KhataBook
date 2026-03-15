const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Role = require('./models/Role');
const UserHasRoleMapping = require('./models/userHasRoleMapping');

// Load environment variables
dotenv.config();

const ROLES = ['superadmin', 'systemadmin', 'admin', 'user'];

const seedData = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // ── Seed Roles ──────────────────────────────────────────────────────────
    console.log('Seeding roles...');
    const roleDescriptions = {
      superadmin:  'Full access to all system features and settings',
      systemadmin: 'Manages system-level configurations and users',
      admin:       'Manages organisation-level data and users',
      user:        'Standard user with limited access'
    };

    const roleMap = {};
    for (const roleName of ROLES) {
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = await Role.create({ name: roleName, description: roleDescriptions[roleName] });
        console.log(`  ✔ Created role: ${roleName}`);
      } else {
        console.log(`  – Role already exists: ${roleName}`);
      }
      roleMap[roleName] = role._id;
    }

    // ── Seed Superadmin User ─────────────────────────────────────────────────
    console.log('\nSeeding superadmin user...');
    const adminEmail    = 'superadmin@example.com';
    const adminPassword = 'password123';

    let superadminUser = await User.findOne({ email: adminEmail });
    if (!superadminUser) {
      const salt           = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      superadminUser = await User.create({
        name:    'Super Admin',
        email:   adminEmail,
        password: hashedPassword
      });
      console.log(`  ✔ Created superadmin user: ${adminEmail}`);
    } else {
      console.log(`  – Superadmin user already exists: ${adminEmail}`);
    }

    // ── Assign Superadmin Role ───────────────────────────────────────────────
    const existingMapping = await UserHasRoleMapping.findOne({
      userId: superadminUser._id,
      roleId: roleMap['superadmin']
    });

    if (!existingMapping) {
      await UserHasRoleMapping.create({
        userId: superadminUser._id,
        roleId: roleMap['superadmin']
      });
      console.log('  ✔ Assigned superadmin role to user');
    } else {
      console.log('  – Superadmin role mapping already exists');
    }

    console.log('\n✅ Seeding complete!');
    console.log(`   Email: ${adminEmail} | Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
