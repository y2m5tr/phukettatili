import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from '../src/pages/api/whatsapp/dispatch-reminders';

describe('/api/whatsapp/dispatch-reminders endpoint', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.CRON_SECRET = 'secret_cron_token_2026';
    delete process.env.WHATSAPP_CLOUD_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('rejects execution with 401 when unauthorized', async () => {
    const request = new Request('https://phukettatili.com/api/whatsapp/dispatch-reminders', {
      method: 'POST',
      headers: {},
    });

    const cookies = {
      get: () => undefined,
    };

    const response = await POST({ request, cookies } as any);
    expect(response.status).toBe(401);
  });

  it('executes successfully when authorized with x-cron-secret', async () => {
    const request = new Request('https://phukettatili.com/api/whatsapp/dispatch-reminders', {
      method: 'POST',
      headers: {
        'x-cron-secret': 'secret_cron_token_2026',
      },
    });

    const cookies = {
      get: () => undefined,
    };

    const response = await POST({ request, cookies } as any);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(typeof data.tomorrowDate).toBe('string');
    expect(data.tomorrowDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof data.sentCount).toBe('number');
    expect(typeof data.failedCount).toBe('number');
  });

  it('executes successfully when authorized with Bearer token in Authorization header', async () => {
    const request = new Request('https://phukettatili.com/api/whatsapp/dispatch-reminders', {
      method: 'POST',
      headers: {
        authorization: 'Bearer secret_cron_token_2026',
      },
    });

    const cookies = {
      get: () => undefined,
    };

    const response = await POST({ request, cookies } as any);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.ok).toBe(true);
  });
});
