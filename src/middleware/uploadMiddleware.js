// for image uploads
import multer from 'multer'; 
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'node:crypto';

const uploadDir = path.join(
    process.cwd(), 
    'public', 
    'uploads', 
    'products'
);

fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = {
    'image/jpeg': '.jpg', 
    'image/png': '.png', 
    'image/webp': '.webp'
};
    
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const extension = allowedTypes[file.mimetype];

        cb(null, `${randomUUID()}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (Object.hasOwn(allowedTypes, file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(
            'Only JPG, PNG, and WebP images are allowed'
        ));
    }
};

export const uploadProductImage = multer({
    storage, 
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single('product_image');