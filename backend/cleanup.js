/* Cleanup MongoDB collections */
require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop all collections
    const collections = ['products', 'users', 'orders', 'carts', 'returns', 'homepages'];
    
    for (const col of collections) {
      try {
        await mongoose.connection.collection(col).drop();
        console.log(`🗑️  Dropped ${col}`);
      } catch (e) {
        if (e.code !== 26) console.log(`⚠️  ${col} not found`);
      }
    }

    console.log('✅ Cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

cleanup();
