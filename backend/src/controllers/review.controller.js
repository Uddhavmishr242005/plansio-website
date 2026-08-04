const Product = require('../models/Product.model');
const Order   = require('../models/Order.model');
const { uploadImage, uploadVideo } = require('../utils/cloudinary.util');
const fs = require('fs');

// ── Submit Review with Photos/Videos ─────────
exports.submitReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.id;

    // Verify buyer
    const bought = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      status: 'Delivered'
    });
    if (!bought) return res.status(403).json({ success: false, message: 'Only verified buyers can review' });

    // Already reviewed?
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const already = product.reviews.find(r => r.user?.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: 'Already reviewed this product' });

    // Upload media
    const media = [];
    if (req.files?.images) {
      for (const f of req.files.images) {
        const r = await uploadImage(f.path, 'plansio/reviews');
        media.push({ type: 'image', url: r.url, publicId: r.publicId });
        fs.unlink(f.path, () => {});
      }
    }
    if (req.files?.video) {
      for (const f of req.files.video) {
        const r = await uploadVideo(f.path, 'plansio/reviews');
        media.push({ type: 'video', url: r.url, publicId: r.publicId });
        fs.unlink(f.path, () => {});
      }
    }

    product.reviews.push({
      user: req.user._id, name: req.user.name,
      rating: Number(rating), title, comment,
      media, verified: true, approved: false
    });
    product.numReviews = product.reviews.length;
    const approved = product.reviews.filter(r => r.approved);
    product.rating  = approved.length
      ? approved.reduce((s, r) => s + r.rating, 0) / approved.length
      : 0;
    await product.save();

    res.status(201).json({ success: true, message: 'Review submitted for approval' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Approve Review ─────────────────────
exports.approveReview = async (req, res) => {
  try {
    const { approved } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.approved = approved;
    // Recalculate rating
    const approvedReviews = product.reviews.filter(r => r.approved);
    product.rating = approvedReviews.length
      ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length : 0;
    await product.save();
    res.json({ success: true, message: `Review ${approved ? 'approved' : 'rejected'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Product Reviews ───────────────────────
exports.getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('reviews rating numReviews')
      .populate('reviews.user', 'name avatar');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const approved = product.reviews.filter(r => r.approved);
    res.json({ success: true, reviews: approved, rating: product.rating, count: approved.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
