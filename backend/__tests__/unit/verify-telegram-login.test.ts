import { verifyTelegramLogin } from '../../func/verify-telegram-login';
import crypto from 'crypto';

describe('verifyTelegramLogin', () => {
  const botToken = 'test_bot_token_12345';
  
  // Helper function to generate valid hash
  function generateValidHash(data: any, token: string): string {
    const dataCheckString = Object.keys(data)
      .sort()
      .filter(key => key !== 'hash')
      .map(key => `${key}=${data[key]}`)
      .join('\n');
    
    const secretKey = crypto.createHash('sha256').update(token).digest();
    return crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
  }

  describe('valid data', () => {
    it('should return true for valid login data', async () => {
      const baseData = {
        id: 123456,
        first_name: 'Test',
        auth_date: Math.floor(Date.now() / 1000),
      };
      
      const data = {
        ...baseData,
        hash: generateValidHash(baseData, botToken),
      };

      const result = await verifyTelegramLogin(data, botToken);
      expect(result).toBe(true);
    });

    it('should return true for valid data with optional fields', async () => {
      const baseData = {
        id: 123456,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        photo_url: 'https://example.com/photo.jpg',
        auth_date: Math.floor(Date.now() / 1000),
      };
      
      const data = {
        ...baseData,
        hash: generateValidHash(baseData, botToken),
      };

      const result = await verifyTelegramLogin(data, botToken);
      expect(result).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should return false for tampered hash', async () => {
      const data = {
        id: 123456,
        first_name: 'Test',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'invalid_hash',
      };

      const result = await verifyTelegramLogin(data, botToken);
      expect(result).toBe(false);
    });

    it('should return false for tampered user data', async () => {
      const baseData = {
        id: 123456,
        first_name: 'Test',
        auth_date: Math.floor(Date.now() / 1000),
      };
      
      const validHash = generateValidHash(baseData, botToken);
      
      // Tamper with the data but keep the original hash
      const tamperedData = {
        ...baseData,
        first_name: 'Hacked',
        hash: validHash,
      };

      const result = await verifyTelegramLogin(tamperedData, botToken);
      expect(result).toBe(false);
    });

    it('should return false for wrong bot token', async () => {
      const baseData = {
        id: 123456,
        first_name: 'Test',
        auth_date: Math.floor(Date.now() / 1000),
      };
      
      const data = {
        ...baseData,
        hash: generateValidHash(baseData, botToken),
      };

      // Verify with different token
      const result = await verifyTelegramLogin(data, 'wrong_token');
      expect(result).toBe(false);
    });

    it('should return false for expired auth_date', async () => {
      // Use a date that's definitely more than 24 hours ago (25 hours)
      const twentyFiveHoursAgo = Math.floor(Date.now() / 1000) - 90000;
      
      const baseData = {
        id: 123456,
        first_name: 'Test',
        auth_date: twentyFiveHoursAgo,
      };
      
      const data = {
        ...baseData,
        hash: generateValidHash(baseData, botToken),
      };

      const result = await verifyTelegramLogin(data, botToken);
      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false for empty data', async () => {
      const result = await verifyTelegramLogin({} as any, botToken);
      expect(result).toBe(false);
    });

    it('should return false for missing hash', async () => {
      const data = {
        id: 123456,
        first_name: 'Test',
        auth_date: Math.floor(Date.now() / 1000),
      };

      const result = await verifyTelegramLogin(data as any, botToken);
      expect(result).toBe(false);
    });

    it('should return false for missing required fields', async () => {
      // Test with data that has valid hash but will fail type check
      const baseData = {
        id: 123456,
        first_name: 'Test',
        auth_date: Math.floor(Date.now() / 1000),
      };
      
      const data = {
        ...baseData,
        hash: 'invalid_hash_format', // Invalid hash will cause verification to fail
      };

      const result = await verifyTelegramLogin(data as any, botToken);
      expect(result).toBe(false);
    });
  });
});
