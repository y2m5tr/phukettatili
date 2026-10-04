/**
 * Environment variables with type safety and validation
 */

export const ENV = {
  SITE_URL: import.meta.env.SITE_URL || 'https://phukettatili.netlify.app',
  WHATSAPP_PHONE: import.meta.env.WHATSAPP_PHONE || '+66828950665',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

export type Environment = typeof ENV;
