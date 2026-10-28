import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '../../../lib/auth';

export const prerender = false;

export const ALL: APIRoute = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return Response.json({ ok: true });
};
