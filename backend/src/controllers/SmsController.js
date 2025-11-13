// backend/src/controllers/SmsController.js
import SmsService from '../services/SmsService.js';

class SmsController {
  async sendBulkSms(req, res, next) {
    try {
      const { lineNumber, messageText, mobiles, sendDateTime } = req.body;

      if (!messageText || typeof messageText !== 'string' || !messageText.trim()) {
        return res.status(400).json({
          success: false,
          message: 'messageText is required and must be a non-empty string',
        });
      }

      if (!Array.isArray(mobiles) || mobiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'mobiles must be a non-empty array of strings (e.g., ["09121234567"])',
        });
      }

      // Normalize & validate mobile numbers (simple check)
      const normalizedMobiles = mobiles.map(m => {
        let num = String(m).trim();
        if (!num.startsWith('09') && !num.startsWith('+989')) {
          throw new Error(`Invalid mobile number: ${m}`);
        }
        // Convert +989... → 09... (SMS.ir expects 09...)
        if (num.startsWith('+989')) {
          num = '0' + num.slice(3);
        }
        return num;
      });

      const result = await SmsService.sendBulk({
        lineNumber,
        messageText,
        mobiles: normalizedMobiles,
        sendDateTime,
      });

      res.status(200).json({
        success: true,
        message: 'SMS sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SmsController();