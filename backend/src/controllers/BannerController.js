import BannerRepository from '../repositories/BannerRepository.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BannerController {
  async getAll(req, res, next) {
    try {
      const activeOnly = req.query.active === 'true';
      const banners = await BannerRepository.getAll(activeOnly);
      res.json(banners);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await BannerRepository.getById(id);

      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      }

      res.json(banner);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { title, link_url, display_order, is_active } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'Banner image is required' });
      }

      const image_url = `/api/uploads/${req.file.filename}`;

      const banner = await BannerRepository.create({
        title,
        image_url,
        link_url,
        display_order: display_order ? parseInt(display_order) : 0,
        is_active: is_active !== undefined ? is_active === 'true' : true
      });

      res.status(201).json(banner);
    } catch (error) {
      if (req.file) {
        const filePath = path.join(__dirname, '../../uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, link_url, display_order, is_active } = req.body;

      const banner = await BannerRepository.getById(id);
      if (!banner) {
        if (req.file) {
          const filePath = path.join(__dirname, '../../uploads', req.file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        return res.status(404).json({ message: 'Banner not found' });
      }

      const updateData = {
        title,
        link_url,
        display_order: display_order ? parseInt(display_order) : undefined,
        is_active: is_active !== undefined ? is_active === 'true' : undefined
      };

      if (req.file) {
        updateData.image_url = `/uploads/${req.file.filename}`;

        if (banner.image_url) {
          const oldFilename = banner.image_url.split('/').pop();
          const oldFilePath = path.join(__dirname, '../../uploads', oldFilename);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }

      const updatedBanner = await BannerRepository.update(id, updateData);
      res.json(updatedBanner);
    } catch (error) {
      if (req.file) {
        const filePath = path.join(__dirname, '../../uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await BannerRepository.getById(id);

      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      }

      if (banner.image_url) {
        const filename = banner.image_url.split('/').pop();
        const filePath = path.join(__dirname, '../../uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await BannerRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new BannerController();
