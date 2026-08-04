const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image
exports.uploadImage = async (filePath, folder = 'plansio/products') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto'
  });
  return { url: result.secure_url, publicId: result.public_id };
};

// Upload video
exports.uploadVideo = async (filePath, folder = 'plansio/videos') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'video',
    chunk_size: 6000000
  });
  return { url: result.secure_url, publicId: result.public_id };
};

// Delete media
exports.deleteMedia = async (publicId, type = 'image') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: type });
};
