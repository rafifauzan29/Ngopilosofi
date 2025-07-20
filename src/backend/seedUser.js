require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await User.findOne({ email: 'admin@ngopilosofi.com' });
    if (existingAdmin) {
      console.log('Admin sudah ada di database');
      return process.exit(0);
    }

    const admin = new User({
      name: 'Admin Ngopilosofi',
      email: 'admin@ngopilosofi.com',
      password: 'admin123', 
      role: 'admin',
      avatar: '', 
    });

    await admin.save();
    console.log('Admin berhasil ditambahkan!');
    process.exit(0);
  } catch (error) {
    console.error('Gagal menambahkan admin:', error);
    process.exit(1);
  }
}

seedAdmin();
