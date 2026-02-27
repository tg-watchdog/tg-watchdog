import { describe, it, expect } from 'vitest';

/**
 * URL Parser utility for verification page
 * Extracts and validates query parameters from verification URL
 */
export function parseVerificationUrl(search: string): {
  chat_id: string | null;
  msg_id: string | null;
  user_id: string | null;
  timestamp: string | null;
  signature: string | null;
  fallback: boolean;
} {
  const params = new URLSearchParams(search);
  
  return {
    chat_id: params.get('chat_id'),
    msg_id: params.get('msg_id'),
    user_id: params.get('user_id'),
    timestamp: params.get('timestamp'),
    signature: params.get('signature'),
    fallback: params.get('fallback') === '1',
  };
}

export function validateVerificationParams(params: ReturnType<typeof parseVerificationUrl>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!params.chat_id) errors.push('Missing chat_id');
  if (!params.msg_id) errors.push('Missing msg_id');
  if (!params.timestamp) errors.push('Missing timestamp');
  if (!params.signature) errors.push('Missing signature');
  
  // Validate chat_id format (should be a number, possibly negative)
  if (params.chat_id && !/^-?\d+$/.test(params.chat_id)) {
    errors.push('Invalid chat_id format');
  }
  
  // Validate timestamp (should be a positive number)
  if (params.timestamp) {
    const timestamp = parseInt(params.timestamp, 10);
    if (isNaN(timestamp) || timestamp <= 0) {
      errors.push('Invalid timestamp');
    }
  }
  
  // Validate signature format (should be hex string)
  if (params.signature && !/^[a-f0-9]{64}$/i.test(params.signature)) {
    errors.push('Invalid signature format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

describe('parseVerificationUrl', () => {
  it('should parse all required parameters', () => {
    const search = '?chat_id=-100123&msg_id=456&timestamp=1700000000&signature=abc123';
    const result = parseVerificationUrl(search);
    
    expect(result.chat_id).toBe('-100123');
    expect(result.msg_id).toBe('456');
    expect(result.timestamp).toBe('1700000000');
    expect(result.signature).toBe('abc123');
    expect(result.fallback).toBe(false);
  });

  it('should parse fallback parameter', () => {
    const search = '?chat_id=-100123&msg_id=456&timestamp=1700000000&signature=abc123&fallback=1';
    const result = parseVerificationUrl(search);
    
    expect(result.fallback).toBe(true);
  });

  it('should handle missing parameters', () => {
    const search = '?chat_id=-100123';
    const result = parseVerificationUrl(search);
    
    expect(result.chat_id).toBe('-100123');
    expect(result.msg_id).toBeNull();
    expect(result.signature).toBeNull();
  });

  it('should handle empty search string', () => {
    const result = parseVerificationUrl('');
    
    expect(result.chat_id).toBeNull();
    expect(result.msg_id).toBeNull();
    expect(result.user_id).toBeNull();
    expect(result.timestamp).toBeNull();
    expect(result.signature).toBeNull();
    expect(result.fallback).toBe(false);
  });
});

describe('validateVerificationParams', () => {
  it('should validate complete params', () => {
    const params = {
      chat_id: '-100123',
      msg_id: '456',
      user_id: '789',
      timestamp: '1700000000',
      signature: 'a'.repeat(64),
      fallback: false,
    };
    
    const result = validateVerificationParams(params);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing required fields', () => {
    const params = {
      chat_id: null,
      msg_id: null,
      user_id: null,
      timestamp: null,
      signature: null,
      fallback: false,
    };
    
    const result = validateVerificationParams(params);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing chat_id');
    expect(result.errors).toContain('Missing msg_id');
    expect(result.errors).toContain('Missing timestamp');
    expect(result.errors).toContain('Missing signature');
  });

  it('should validate chat_id format', () => {
    const params = {
      chat_id: 'invalid',
      msg_id: '456',
      user_id: '789',
      timestamp: '1700000000',
      signature: 'a'.repeat(64),
      fallback: false,
    };
    
    const result = validateVerificationParams(params);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid chat_id format');
  });

  it('should accept negative chat_id', () => {
    const params = {
      chat_id: '-1001234567890',
      msg_id: '456',
      user_id: '789',
      timestamp: '1700000000',
      signature: 'a'.repeat(64),
      fallback: false,
    };
    
    const result = validateVerificationParams(params);
    expect(result.errors).not.toContain('Invalid chat_id format');
  });

  it('should validate timestamp', () => {
    const params = {
      chat_id: '-100123',
      msg_id: '456',
      user_id: '789',
      timestamp: 'not-a-number',
      signature: 'a'.repeat(64),
      fallback: false,
    };
    
    const result = validateVerificationParams(params);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid timestamp');
  });

  it('should validate signature format', () => {
    const params = {
      chat_id: '-100123',
      msg_id: '456',
      user_id: '789',
      timestamp: '1700000000',
      signature: 'too-short',
      fallback: false,
    };
    
    const result = validateVerificationParams(params);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid signature format');
  });

  it('should accept valid hex signature', () => {
    const params = {
      chat_id: '-100123',
      msg_id: '456',
      user_id: '789',
      timestamp: '1700000000',
      signature: 'abcdef0123456789'.repeat(4),
      fallback: false,
    };
    
    const result = validateVerificationParams(params);
    expect(result.errors).not.toContain('Invalid signature format');
  });
});
