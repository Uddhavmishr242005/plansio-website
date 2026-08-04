const { uploadImage, uploadVideo, deleteMedia } = require('../utils/cloudinary.util');
const Product = require('../models/Product.model');
const Homepage = require('../models/Homepage.model');
const path = require('path');
const fs = require('fs');

// ── Upload Product Image ──────────────────────
exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const result = await uploadImage(req.file.path, 'plansio/products');

    // Clean up temp file
    fs.unlink(req.file.path, () => {});

    // If productId provided, attach to product
    if (req.body.productId) {
      await Product.findByIdAndUpdate(req.body.productId, {
        $push: { images: { url: result.url, publicId: result.publicId } }
      });
    }

    res.json({ success: true, url: result.url, publicId: result.publicId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Upload Video ──────────────────────────────
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video uploaded' });

    const result = await uploadVideo(req.file.path, 'plansio/videos');
    fs.unlink(req.file.path, () => {});

    // If productId provided, attach video to product
    if (req.body.productId) {
      await Product.findByIdAndUpdate(req.body.productId, {
        $push: { videos: { url: result.url, publicId: result.publicId, title: req.body.title || '' } }
      });
    }

    // If heroSlide provided, update homepage
    if (req.body.section === 'hero') {
      let homepage = await Homepage.findOne({ key: 'main' });
      if (!homepage) homepage = new Homepage({ key: 'main' });
      homepage.heroSlides.push({
        video: result.url, videoId: result.publicId,
        title: req.body.title || '', order: homepage.heroSlides.length
      });
      await homepage.save();
    }

    res.json({ success: true, url: result.url, publicId: result.publicId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Media ──────────────────────────────
exports.deleteMedia = async (req, res) => {
  try {
    const { publicId, type = 'image' } = req.body;
    if (!publicId) return res.status(400).json({ success: false, message: 'publicId required' });
    await deleteMedia(publicId, type);
    res.json({ success: true, message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Upload Hero Slide Image ───────────────────
exports.uploadHeroImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const result = await uploadImage(req.file.path, 'plansio/hero');
    fs.unlink(req.file.path, () => {});

    let homepage = await Homepage.findOne({ key: 'main' });
    if (!homepage) homepage = new Homepage({ key: 'main' });

    const slideIndex = req.body.slideIndex || homepage.heroSlides.length;
    if (homepage.heroSlides[slideIndex]) {
      homepage.heroSlides[slideIndex].image = result.url;
      homepage.heroSlides[slideIndex].imageId = result.publicId;
    } else {
      homepage.heroSlides.push({
        image: result.url, imageId: result.publicId,
        title: req.body.title || '', order: slideIndex
      });
    }
    await homepage.save();

    res.json({ success: true, url: result.url, publicId: result.publicId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
