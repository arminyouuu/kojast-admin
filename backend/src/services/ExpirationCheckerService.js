import TelegramBot from 'node-telegram-bot-api';
import PlaceRepository from '../repositories/PlaceRepository.js';
import SettingsRepository from '../repositories/SettingsRepository.js';
import { format } from 'date-fns-jalali';

class ExpirationCheckerService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkIntervalHours = 24;
  }

  formatJalaliDate(dateString) {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy/MM/dd');
    } catch (error) {
      return dateString;
    }
  }

  async sendTelegramNotification(message) {
    try {
      const botTokenSetting = await SettingsRepository.get('telegram_bot_token');
      const chatIdSetting = await SettingsRepository.get('telegram_chat_id');

      if (!botTokenSetting || !botTokenSetting.setting_value) {
        console.log('Telegram bot token not configured');
        return false;
      }

      if (!chatIdSetting || !chatIdSetting.setting_value) {
        console.log('Telegram chat ID not configured');
        return false;
      }

      const bot = new TelegramBot(botTokenSetting.setting_value, { polling: false });
      await bot.sendMessage(chatIdSetting.setting_value, message, { parse_mode: 'HTML' });

      console.log('Telegram notification sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      return false;
    }
  }

  async checkExpirations() {
    try {
      console.log('Checking for expiring and expired places...');

      const expiringPlaces = await PlaceRepository.findExpiringSoon(7);
      const expiredPlaces = await PlaceRepository.findExpired();

      if (expiringPlaces.length === 0 && expiredPlaces.length === 0) {
        console.log('No places expiring soon or expired');
        return;
      }

      console.log(`Found ${expiringPlaces.length} place(s) expiring soon and ${expiredPlaces.length} expired place(s)`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const messages = [];

      for (const place of expiredPlaces) {
        const expirationDate = new Date(place.expiration_date);
        expirationDate.setHours(0, 0, 0, 0);

        const daysSinceExpiration = Math.floor((today - expirationDate) / (1000 * 60 * 60 * 24));

        let urgency = '';
        if (daysSinceExpiration === 0) {
          urgency = '🔴 امروز منقضی شده است!';
        } else if (daysSinceExpiration === 1) {
          urgency = '🔴 دیروز منقضی شده است!';
        } else {
          urgency = `🔴 ${daysSinceExpiration} روز پیش منقضی شده است!`;
        }

        messages.push(
          `<b>${place.name}</b>\n` +
          `دسته‌بندی: ${place.category_name || 'نامشخص'}\n` +
          `آدرس: ${place.address || 'نامشخص'}\n` +
          `${urgency}\n` +
          `تاریخ انقضا: ${this.formatJalaliDate(place.expiration_date)}`
        );
      }

      for (const place of expiringPlaces) {
        const expirationDate = new Date(place.expiration_date);
        expirationDate.setHours(0, 0, 0, 0);

        const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

        let urgency = '';
        if (daysUntilExpiration === 0) {
          urgency = '🔴 امروز منقضی می‌شود!';
        } else if (daysUntilExpiration === 1) {
          urgency = '🟠 فردا منقضی می‌شود!';
        } else if (daysUntilExpiration <= 3) {
          urgency = `🟡 ${daysUntilExpiration} روز دیگر منقضی می‌شود`;
        } else {
          urgency = `⚪️ ${daysUntilExpiration} روز دیگر منقضی می‌شود`;
        }

        messages.push(
          `<b>${place.name}</b>\n` +
          `دسته‌بندی: ${place.category_name || 'نامشخص'}\n` +
          `آدرس: ${place.address || 'نامشخص'}\n` +
          `${urgency}\n` +
          `تاریخ انقضا: ${this.formatJalaliDate(place.expiration_date)}`
        );
      }

      if (messages.length > 0) {
        const totalCount = expiredPlaces.length + expiringPlaces.length;
        let headerText = '';

        if (expiredPlaces.length > 0 && expiringPlaces.length > 0) {
          headerText = `${expiredPlaces.length} مکان منقضی شده و ${expiringPlaces.length} مکان در حال نزدیک شدن به تاریخ انقضا هستند:`;
        } else if (expiredPlaces.length > 0) {
          headerText = `${expiredPlaces.length} مکان منقضی شده است:`;
        } else {
          headerText = `${expiringPlaces.length} مکان در حال نزدیک شدن به تاریخ انقضا هستند:`;
        }

        const fullMessage =
          `⚠️ <b>هشدار انقضای مکان‌ها</b> ⚠️\n\n` +
          headerText + `\n\n` +
          messages.join('\n\n---\n\n');

        await this.sendTelegramNotification(fullMessage);
      }
    } catch (error) {
      console.error('Error checking expirations:', error);
    }
  }

  start() {
    if (this.isRunning) {
      console.log('Expiration checker is already running');
      return;
    }

    console.log(`Starting expiration checker service (checking every ${this.checkIntervalHours} hours)`);
    this.isRunning = true;

    this.checkExpirations();

    this.intervalId = setInterval(() => {
      this.checkExpirations();
    }, this.checkIntervalHours * 60 * 60 * 1000);
  }

  stop() {
    if (!this.isRunning) {
      console.log('Expiration checker is not running');
      return;
    }

    console.log('Stopping expiration checker service');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default new ExpirationCheckerService();
