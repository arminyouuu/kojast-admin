// backend/src/services/SmsService.js
import axios from 'axios';

class SmsService {
  constructor() {
    this.apiKey = process.env.SMS_IR_API_KEY;
    this.baseUrl = 'https://api.sms.ir/v1/send/bulk';

    if (!this.apiKey) {
      console.warn('⚠️ SMS_IR_API_KEY is not set in environment. SMS sending will fail.');
    }
  }

  async sendBulk({ lineNumber, messageText, mobiles, sendDateTime = null }) {
    if (!this.apiKey) {
      throw new Error('SMS_IR_API_KEY is not configured');
    }

    if (!Array.isArray(mobiles) || mobiles.length === 0) {
      throw new Error('mobiles must be a non-empty array');
    }

    if (mobiles.length > 100) {
      throw new Error('Maximum 100 mobile numbers allowed per request');
    }

    const payload = {
      lineNumber: lineNumber || parseInt(process.env.SMS_IR_LINE_NUMBER, 10) || undefined,
      messageText,
      mobiles,
      sendDateTime,
    };

    try {
      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const { status, message, data } = response.data;

      if (status !== 1) {
        throw new Error(`SMS.ir API error: ${message || 'Unknown error'}`);
      }

      return {
        success: true,
        packId: data.packId,
        messageIds: data.messageIds,
        cost: data.cost,
      };
    } catch (error) {
      let msg = 'Failed to send SMS';
      if (error.response) {
        const errData = error.response.data;
        msg = `SMS.ir error ${error.response.status}: ${errData?.message || JSON.stringify(errData)}`;
      } else if (error.request) {
        msg = 'No response from SMS.ir (network timeout?)';
      } else {
        msg = error.message;
      }
      throw new Error(msg);
    }
  }
}

export default new SmsService();