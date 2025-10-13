import express from 'express';
import SettingsRepository from '../repositories/SettingsRepository.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const settings = await SettingsRepository.getAll();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { key, value } = req.body;

    if (!key) {
      return res.status(400).json({ message: 'Setting key is required' });
    }

    const setting = await SettingsRepository.set(key, value || '');
    res.json(setting);
  } catch (error) {
    next(error);
  }
});

router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await SettingsRepository.get(key);

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(setting);
  } catch (error) {
    next(error);
  }
});

router.delete('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    await SettingsRepository.delete(key);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
