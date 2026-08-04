/* Seed test products to MongoDB */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product.model');

const testProducts = [
  {
    title: 'Premium Vermicompost - 5kg',
    description: 'Premium quality vermicompost enriched with 100% organic nutrients. Perfect for all plants and vegetables.',
    shortDesc: 'Rich organic fertilizer for healthy growth',
    category: 'fertiliser',
    price: 299,
    mrp: 499,
    stock: 50,
    badge: 'FREE',
    images: [{ url: 'https://via.placeholder.com/400x400?text=Vermicompost', publicId: 'placeholder' }],
    features: ['100% Organic', 'No Chemicals', 'Lab Tested', 'Rich in Nutrients'],
    nutrients: { n: '1.2%', p: '0.8%', k: '1.5%' },
    isFeatured: true
  },
  {
    title: 'Neem Powder - Pure Extract',
    description: 'Natural neem powder for pest control and plant health. 100% pure, no additives.',
    shortDesc: 'Organic pest control solution',
    category: 'pestcontrol',
    price: 199,
    mrp: 349,
    stock: 100,
    badge: 'FREE',
    images: [{ url: 'https://via.placeholder.com/400x400?text=Neem+Powder', publicId: 'placeholder' }],
    features: ['Natural Pesticide', 'Safe for Soil', 'Boosts Immunity'],
    isFeatured: true
  },
  {
    title: 'Vermicompost + Neem Bundle',
    description: 'Complete organic gardening combo - vermicompost + neem powder. Best value for beginners.',
    shortDesc: 'Complete organic gardening solution',
    category: 'combo',
    price: 399,
    mrp: 699,
    stock: 30,
    badge: 'Sale',
    images: [{ url: 'https://via.placeholder.com/400x400?text=Bundle', publicId: 'placeholder' }],
    features: ['Bundle Combo', 'Save 43%', 'Perfect Starter Kit'],
    isFeatured: true
  },
  {
    title: 'Worm Bin Starter Kit',
    description: 'Complete vermicomposting setup with worms, bedding, and guide. Start composting at home!',
    shortDesc: 'DIY home composting kit',
    category: 'fertiliser',
    price: 1299,
    mrp: 1999,
    stock: 15,
    images: [{ url: 'https://via.placeholder.com/400x400?text=Worm+Bin', publicId: 'placeholder' }],
    features: ['3-Layer Design', 'Includes Worms', 'Instruction Guide', 'Drainage System']
  },
  {
    title: 'Organic Potting Mix - 10L',
    description: 'Premium potting soil mix with coconut coir, perlite, and peat. Ideal for indoor plants.',
    shortDesc: 'Ready-to-use potting soil',
    category: 'fertiliser',
    price: 249,
    mrp: 399,
    stock: 60,
    images: [{ url: 'https://via.placeholder.com/400x400?text=Potting+Mix', publicId: 'placeholder' }],
    features: ['Coconut Coir Base', 'Lightweight', 'Drainage Ready', 'pH Balanced']
  }
];

async function seedDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop existing products
    await mongoose.connection.collection('products').deleteMany({});
    
    const created = await Product.insertMany(testProducts);
    console.log(`✅ ${created.length} products seeded!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Error:', err.message);
    process.exit(1);
  }
}

seedDb();
