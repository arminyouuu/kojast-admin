import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

class ImageUploadController {
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const file = req.file;
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
      const filePath = `${fileName}`;

      const fileBuffer = fs.readFileSync(file.path);

      const { data, error } = await supabase.storage
        .from('place-images')
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      fs.unlinkSync(file.path);

      if (error) {
        console.error('Supabase upload error:', error);
        throw { status: 500, message: `Upload failed: ${error.message}` };
      }

      const { data: publicUrlData } = supabase.storage
        .from('place-images')
        .getPublicUrl(filePath);

      res.json({
        success: true,
        url: publicUrlData.publicUrl,
        path: filePath
      });
    } catch (error) {
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const { path: imagePath } = req.body;

      if (!imagePath) {
        return res.status(400).json({ message: 'Image path is required' });
      }

      const { error } = await supabase.storage
        .from('place-images')
        .remove([imagePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw { status: 500, message: `Delete failed: ${error.message}` };
      }

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ImageUploadController();
