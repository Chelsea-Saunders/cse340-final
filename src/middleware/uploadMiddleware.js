// for image uploads
import multer from 'multer'; 
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = path.extname(file.originalname).toLowerCase();

        cb(null, `${uniqueName}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, and WebP images are allowed'));
    }
};

export const uploadProductImage = multer({
    storage, 
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single('product_image');