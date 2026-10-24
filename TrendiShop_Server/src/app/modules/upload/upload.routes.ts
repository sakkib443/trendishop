import express from 'express';
import { upload, videoUpload } from '../../utils/fileUpload';
import { uploadController } from './upload.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';

const router = express.Router();

// POST /api/upload/image  — single image (public: reviews, admin)
router.post(
    '/image',
    upload.single('image'),
    uploadController.uploadSingle,
);

// POST /api/upload/images — multiple up to 10 (admin / reviews)
router.post(
    '/images',
    upload.array('images', 10),
    uploadController.uploadMultiple,
);

// POST /api/upload/my-images — multiple up to 5
router.post(
    '/my-images',
    upload.array('images', 5),
    uploadController.uploadMultiple,
);

// POST /api/upload/video — one product video (admin / editor only: up to 100MB)
router.post(
    '/video',
    authMiddleware,
    authorizeRoles('admin', 'editor'),
    videoUpload.single('video'),
    uploadController.uploadSingle,
);

export const UploadRoutes = router;
