import express from 'express';
import BannerController from '../controllers/BannerController.js';
import upload from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', BannerController.getAll);
router.get('/:id', BannerController.getById);

router.post('/', authenticate, upload.single('image'), BannerController.create);
router.put('/:id', authenticate, upload.single('image'), BannerController.update);
router.delete('/:id', authenticate, BannerController.delete);

export default router;
