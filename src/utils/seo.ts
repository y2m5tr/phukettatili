/**
 * SEO utility functions
 */

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  locale?: string;
  siteName?: string;
}

/**
 * Generate canonical URL
 */
export function getCanonicalURL(path: string, baseURL: string): string {
  const url = new URL(path, baseURL);
  return url.toString();
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate meta description from content
 */
export function generateDescription(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const stripped = content.replace(/<[^>]*>/g, '');
  // Remove extra whitespace
  const cleaned = stripped.replace(/\s+/g, ' ').trim();
  return truncate(cleaned, maxLength);
}

/**
 * Format date for Schema.org
 */
export function formatSchemaDate(date: Date): string {
  return date.toISOString();
}
