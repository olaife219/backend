require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads/profile-picture/',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req, file) => {
            return 'custom-name-' + Date.now();
        },
    },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, }).single('image');


module.exports = {upload}
