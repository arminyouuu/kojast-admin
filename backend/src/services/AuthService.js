import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import UserRepository from '../repositories/UserRepository.js';
import SessionRepository from '../repositories/SessionRepository.js';

class AuthService {
  async register(userData) {
    const { phone_number, email, password, full_name } = userData;

    if (!phone_number && !email) {
      throw new Error('Either phone number or email is required');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (phone_number) {
      const existingUser = await UserRepository.findByPhoneNumber(phone_number);
      if (existingUser) {
        throw new Error('Phone number already registered');
      }
    }

    if (email) {
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already registered');
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = await UserRepository.create({
      phone_number,
      email,
      password_hash,
      full_name
    });

    const user = await UserRepository.findById(userId);
    return this.createUserResponse(user);
  }

  async login(credentials, deviceInfo = null) {
    const { phone_number, email, password } = credentials;

    if (!phone_number && !email) {
      throw new Error('Phone number or email is required');
    }

    let user;
    if (phone_number) {
      user = await UserRepository.findByPhoneNumber(phone_number);
    } else {
      user = await UserRepository.findByEmail(email);
    }

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('اکانت غیرفعال است');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    await UserRepository.updateLastLogin(user.id);

    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await SessionRepository.create(user.id, token, deviceInfo, expiresAt);

    return {
      token,
      expiresAt,
      user: this.createUserResponse(user)
    };
  }

  async logout(token) {
    await SessionRepository.deleteByToken(token);
  }

  async validateSession(token) {
    const session = await SessionRepository.findByToken(token);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    if (!session.is_active) {
      throw new Error('اکانت غیرفعال است');
    }

    return this.createUserResponse(session);
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await UserRepository.findById(userId);

    const fullUser = await (user.phone_number
      ? UserRepository.findByPhoneNumber(user.phone_number)
      : UserRepository.findByEmail(user.email));

    const isPasswordValid = await bcrypt.compare(oldPassword, fullUser.password_hash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(userId, password_hash);

    await SessionRepository.deleteUserSessions(userId);
  }

  generateToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  async checkCredentials(credentials) {
    const { phone_number, email } = credentials;

    if (phone_number) {
      const user = await UserRepository.findByPhoneNumber(phone_number);
      return !!user;
    }

    if (email) {
      const user = await UserRepository.findByEmail(email);
      return !!user;
    }

    return false;
  }

  createUserResponse(user) {
    return {
      id: user.id,
      phone_number: user.phone_number,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
      last_login: user.last_login
    };
  }
}

export default new AuthService();
