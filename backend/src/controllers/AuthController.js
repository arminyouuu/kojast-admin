import AuthService from '../services/AuthService.js';

class AuthController {
  async register(req, res, next) {
    try {
      const { phone_number, email, password, full_name } = req.body;

      const user = await AuthService.register({
        phone_number,
        email,
        password,
        full_name
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { phone_number, email, password } = req.body;
      const deviceInfo = req.headers['user-agent'];

      const result = await AuthService.login(
        { phone_number, email, password },
        deviceInfo
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        await AuthService.logout(token);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { full_name, email, phone_number } = req.body;
      const UserRepository = (await import('../repositories/UserRepository.js')).default;

      const updatedUser = await UserRepository.update(req.user.id, {
        full_name,
        email,
        phone_number
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { old_password, new_password } = req.body;

      if (!old_password || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Both old and new passwords are required'
        });
      }

      await AuthService.changePassword(req.user.id, old_password, new_password);

      res.json({
        success: true,
        message: 'Password changed successfully. Please login again.'
      });
    } catch (error) {
      next(error);
    }
  }

  async checkCredentials(req, res, next) {
    try {
      const { phone_number, email } = req.body;

      if (!phone_number && !email) {
        return res.status(400).json({
          success: false,
          message: 'Either phone number or email is required'
        });
      }

      const exists = await AuthService.checkCredentials({ phone_number, email });

      res.json({
        success: true,
        data: {
          exists,
          credential: phone_number || email
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
