const mongoose = require('mongoose');

const homepageSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  heroSlides: [{
    image:    String,
    imageId:  String,
    video:    String,
    videoId:  String,
    title:    String,
    subtitle: String,
    ctaText:  String,
    ctaLink:  String,
    order:    Number
  }],
  sections: [{
    id:       String,
    template: String,
    title:    String,
    subtitle: String,
    videos:   [{ url: String, title: String, videoId: String }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    config:   mongoose.Schema.Types.Mixed,
    isActive: { type: Boolean, default: true },
    order:    Number
  }],
  trustBar: [{
    icon: String, text: String, order: Number
  }],
  announcements: [String],
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Homepage', homepageSchema);
