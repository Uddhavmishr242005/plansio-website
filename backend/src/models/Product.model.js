const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name:     String,
  weight:   String,
  price:    Number,
  mrp:      Number,
  stock:    { type: Number, default: 0 },
  sku:      String
});

const reviewSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:      String,
  rating:    { type: Number, min: 1, max: 5 },
  comment:   String,
  verified:  { type: Boolean, default: false },
  approved:  { type: Boolean, default: false }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  slug:         { type: String, unique: true, lowercase: true },
  description:  { type: String },
  shortDesc:    { type: String },
  category:     { type: String, required: true },
  subCategory:  String,
  brand:        { type: String, default: 'PLANSIO' },
  templateId:   { type: String, default: 'template_standard' },
  templateConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  images:       [{ url: String, publicId: String }],
  videos:       [{ url: String, publicId: String, title: String }],
  variants:     [variantSchema],
  price:        { type: Number, required: true },
  mrp:          { type: Number },
  stock:        { type: Number, default: 0 },
  badge:        String,
  tags:         [String],
  nutrients:    { n: String, p: String, k: String, extra: [] },
  features:     [String],
  isFeatured:   { type: Boolean, default: false },
  isFreeGift:   { type: Boolean, default: false },
  freeGiftWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  reviews:      [reviewSchema],
  rating:       { type: Number, default: 0 },
  numReviews:   { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
  seo: {
    metaTitle:  String,
    metaDesc:   String,
    keywords:   [String]
  }
}, { timestamps: true });

// Auto-generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
