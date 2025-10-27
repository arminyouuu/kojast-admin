import express from 'express';
import BannerController from '../controllers/BannerController.js';
import upload from '../middleware/upload.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', BannerController.getAll);
router.get('/:id', BannerController.getById);

router.post('/', authenticateAdmin, upload.single('image'), BannerController.create);
router.put('/:id', authenticateAdmin, upload.single('image'), BannerController.update);
router.delete('/:id', authenticateAdmin, BannerController.delete);

export default router;
