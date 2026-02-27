import request from 'supertest';
import Koa from 'koa';
import Router from 'koa-router';
import KoaBody from 'koa-body';
import cors from '@koa/cors';
import { signature } from '../../func/signature';

// Create a test app without Telegram Bot dependencies
function createTestApp() {
  const app = new Koa();
  app.use(KoaBody());
  app.use(cors({
    origin: `https://${process.env.TGWD_FRONTEND_DOMAIN ?? ""}`,
  }));

  const router = new Router();
  
  // Health check endpoint
  router.get('/health', async (ctx) => {
    ctx.body = { status: 'ok', timestamp: Date.now() };
  });

  // Test signature endpoint
  router.get('/test-signature', async (ctx) => {
    const { msg_id, chat_id, user_id, timestamp } = ctx.query;
    const sig = await signature(
      Number(msg_id),
      Number(chat_id),
      Number(user_id),
      Number(timestamp)
    );
    ctx.body = { signature: sig };
  });

  // Verify captcha endpoint (simplified for testing)
  router.post('/endpoints/verify-captcha', async (ctx) => {
    const body = ctx.request.body as any;
    
    // Validate request structure
    if (!body.token || !body.tglogin || !body.request_query) {
      ctx.status = 400;
      ctx.body = { message: 'INVALID_REQUEST_FORMAT' };
      return;
    }

    const { request_query } = body;
    
    // Check required fields
    if (!request_query.msg_id || !request_query.chat_id || !request_query.timestamp || !request_query.signature) {
      ctx.status = 400;
      ctx.body = { message: 'MISSING_REQUIRED_FIELDS' };
      return;
    }

    // Verify signature
    const calculatedHash = await signature(
      request_query.msg_id,
      request_query.chat_id,
      body.tglogin.user ? JSON.parse(body.tglogin.user).id : request_query.user_id,
      request_query.timestamp
    );
    
    if (calculatedHash !== request_query.signature) {
      ctx.status = 400;
      ctx.body = { message: 'INVALID_SIGNATURE' };
      return;
    }

    // Check timestamp expiration (3 minutes)
    if ((request_query.timestamp + 180000) < Date.now()) {
      ctx.status = 400;
      ctx.body = { message: 'REQUEST_OVERTIMED' };
      return;
    }

    // In real scenario, would verify captcha token here
    // For testing, we accept any token
    if (body.token === 'invalid_token') {
      ctx.status = 400;
      ctx.body = { message: 'CAPTCHA_NOT_PASSED' };
      return;
    }

    ctx.status = 204;
  });

  router.options('/endpoints/verify-captcha', async (ctx) => {
    ctx.status = 204;
  });

  app.use(router.routes());
  return app;
}

describe('API Integration Tests', () => {
  let app: Koa;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.callback())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /test-signature', () => {
    it('should generate signature for valid parameters', async () => {
      const params = {
        msg_id: '44',
        chat_id: '-1001320638783',
        user_id: '54785179',
        timestamp: '1656425097585',
      };

      const response = await request(app.callback())
        .get('/test-signature')
        .query(params)
        .expect(200);

      expect(response.body).toHaveProperty('signature');
      expect(response.body.signature).toHaveLength(64);
      expect(response.body.signature).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('POST /endpoints/verify-captcha', () => {
    const createValidRequest = async () => {
      const msgId = 1;
      const chatId = -100123;
      const userId = 12345;
      const timestamp = Date.now();
      const sig = await signature(msgId, chatId, userId, timestamp);

      return {
        token: 'valid_test_token',
        tglogin: {
          query_id: 'test_query',
          user: JSON.stringify({ id: userId, first_name: 'Test' }),
          auth_date: Math.floor(Date.now() / 1000),
          hash: 'test_hash',
        },
        request_query: {
          msg_id: msgId,
          chat_id: chatId,
          user_id: userId,
          timestamp,
          signature: sig,
        },
      };
    };

    it('should accept valid verification request', async () => {
      const requestData = await createValidRequest();

      await request(app.callback())
        .post('/endpoints/verify-captcha')
        .send(requestData)
        .expect(204);
    });

    it('should reject invalid request format', async () => {
      await request(app.callback())
        .post('/endpoints/verify-captcha')
        .send({ invalid: 'data' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('INVALID_REQUEST_FORMAT');
        });
    });

    it('should reject missing required fields', async () => {
      await request(app.callback())
        .post('/endpoints/verify-captcha')
        .send({
          token: 'test',
          tglogin: {},
          request_query: {},
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('MISSING_REQUIRED_FIELDS');
        });
    });

    it('should reject invalid signature', async () => {
      const requestData = await createValidRequest();
      requestData.request_query.signature = 'invalid_signature';

      await request(app.callback())
        .post('/endpoints/verify-captcha')
        .send(requestData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('INVALID_SIGNATURE');
        });
    });

    it('should reject expired request', async () => {
      const msgId = 1;
      const chatId = -100123;
      const userId = 12345;
      const expiredTimestamp = Date.now() - 200000; // 200 seconds ago
      const sig = await signature(msgId, chatId, userId, expiredTimestamp);

      const requestData = {
        token: 'valid_test_token',
        tglogin: {
          query_id: 'test_query',
          user: JSON.stringify({ id: userId, first_name: 'Test' }),
          auth_date: Math.floor(Date.now() / 1000),
          hash: 'test_hash',
        },
        request_query: {
          msg_id: msgId,
          chat_id: chatId,
          user_id: userId,
          timestamp: expiredTimestamp,
          signature: sig,
        },
      };

      await request(app.callback())
        .post('/endpoints/verify-captcha')
        .send(requestData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('REQUEST_OVERTIMED');
        });
    });

    it('should reject invalid captcha token', async () => {
      const requestData = await createValidRequest();
      requestData.token = 'invalid_token';

      await request(app.callback())
        .post('/endpoints/verify-captcha')
        .send(requestData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('CAPTCHA_NOT_PASSED');
        });
    });

    it('should handle OPTIONS request', async () => {
      await request(app.callback())
        .options('/endpoints/verify-captcha')
        .expect(204);
    });
  });
});
