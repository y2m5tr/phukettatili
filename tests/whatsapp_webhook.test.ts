import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { GET, POST } from '../src/pages/api/whatsapp/webhook';

describe('/api/whatsapp/webhook endpoint', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'test_verify_token_2026';
    delete process.env.WHATSAPP_APP_SECRET;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('responds with challenge on GET when verify_token matches', async () => {
    const url = new URL('https://phukettatili.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test_verify_token_2026&hub.challenge=1158201444');
    const response = await GET({ url } as any);

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe('1158201444');
  });

  it('rejects GET with 403 when verify_token does not match', async () => {
    const url = new URL('https://phukettatili.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=1158201444');
    const response = await GET({ url } as any);

    expect(response.status).toBe(403);
  });

  it('handles POST event payload and returns 200 EVENT_RECEIVED', async () => {
    // Fail-closed politika: appSecret TANIMSIZSA olaylar reddedilir.
    // Bu test geçerli imzalı bir payload ile 200 akışını doğrular.
    const secret = 'secret_key_123';
    process.env.WHATSAPP_APP_SECRET = secret;
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '66828950665',
                  phone_number_id: '123456789',
                },
                messages: [
                  {
                    from: '905551234567',
                    id: 'wamid.HBgLMDY=',
                    timestamp: '1700000000',
                    text: { body: 'Tamam otel lobisinde olacağız.' },
                    type: 'text',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const bodyStr = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(bodyStr, 'utf8');

    const request = new Request('https://phukettatili.com/api/whatsapp/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': `sha256=${hmac.digest('hex')}`,
      },
      body: bodyStr,
    });

    const response = await POST({ request } as any);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe('EVENT_RECEIVED');
  });

  it('rejects POST with 503 when app secret is NOT configured (fail-closed)', async () => {
    delete process.env.WHATSAPP_APP_SECRET;
    const payload = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });

    const request = new Request('https://phukettatili.com/api/whatsapp/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });

    const response = await POST({ request } as any);
    expect(response.status).toBe(503);
  });

  it('rejects POST with 401 when app secret is set and signature is invalid', async () => {
    process.env.WHATSAPP_APP_SECRET = 'secret_key_123';
    const payload = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });

    const request = new Request('https://phukettatili.com/api/whatsapp/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=invalid_signature',
      },
      body: payload,
    });

    const response = await POST({ request } as any);
    expect(response.status).toBe(401);
  });

  it('accepts POST with 200 when signature matches app secret', async () => {
    const secret = 'secret_key_123';
    process.env.WHATSAPP_APP_SECRET = secret;
    const bodyStr = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(bodyStr, 'utf8');
    const validSignature = `sha256=${hmac.digest('hex')}`;

    const request = new Request('https://phukettatili.com/api/whatsapp/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': validSignature,
      },
      body: bodyStr,
    });

    const response = await POST({ request } as any);
    expect(response.status).toBe(200);
  });
});
