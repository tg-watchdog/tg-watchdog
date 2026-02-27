import signature from '../../func/signature';

describe('signature', () => {
  const testCases = [
    {
      name: 'standard case',
      msgId: 44,
      chatId: -1001320638783,
      userId: 54785179,
      timestamp: 1656425097585,
    },
    {
      name: 'negative chat ID',
      msgId: 1,
      chatId: -1001234567890,
      userId: 123456789,
      timestamp: 1700000000000,
    },
    {
      name: 'large numbers',
      msgId: 999999,
      chatId: -1009999999999,
      userId: 999999999,
      timestamp: 9999999999999,
    },
  ];

  describe('consistency', () => {
    testCases.forEach(({ name, msgId, chatId, userId, timestamp }) => {
      it(`should generate consistent hash for ${name}`, async () => {
        const result1 = await signature(msgId, chatId, userId, timestamp);
        const result2 = await signature(msgId, chatId, userId, timestamp);
        
        expect(result1).toBe(result2);
        expect(result1).toHaveLength(64); // SHA-256 hex length
        expect(result1).toMatch(/^[a-f0-9]{64}$/); // hex format
      });
    });
  });

  describe('uniqueness', () => {
    it('should generate different hash for different msgId', async () => {
      const result1 = await signature(1, -1001320638783, 54785179, 1656425097585);
      const result2 = await signature(2, -1001320638783, 54785179, 1656425097585);
      
      expect(result1).not.toBe(result2);
    });

    it('should generate different hash for different chatId', async () => {
      const result1 = await signature(1, -1001320638783, 54785179, 1656425097585);
      const result2 = await signature(1, -1001320638784, 54785179, 1656425097585);
      
      expect(result1).not.toBe(result2);
    });

    it('should generate different hash for different userId', async () => {
      const result1 = await signature(1, -1001320638783, 54785179, 1656425097585);
      const result2 = await signature(1, -1001320638783, 54785180, 1656425097585);
      
      expect(result1).not.toBe(result2);
    });

    it('should generate different hash for different timestamp', async () => {
      const result1 = await signature(1, -1001320638783, 54785179, 1656425097585);
      const result2 = await signature(1, -1001320638783, 54785179, 1656425097586);
      
      expect(result1).not.toBe(result2);
    });
  });

  describe('edge cases', () => {
    it('should handle zero values', async () => {
      const result = await signature(0, 0, 0, 0);
      
      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should handle very large timestamp', async () => {
      const result = await signature(1, -100123, 123, 999999999999999);
      
      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
