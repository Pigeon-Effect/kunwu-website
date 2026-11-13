import { defineMiddleware } from 'astro:middleware';

/**
 * Wraps every visible "[PLACEHOLDER: ...]" in <mark class="ph"> so missing content is
 * impossible to overlook – in Markdown, JSON strings and components alike.
 * Runs at build time only (static output). Text inside tags/attributes, <title>,
 * <script>, <style> and <textarea> is left untouched.
 */
const PLACEHOLDER = /\[PLACEHOLDER:[^\]<]*\]/g;
/** Elements whose content is not markup – set aside before touching anything. */
const RAW_TEXT = /<(script|style|title|textarea)\b[\s\S]*?<\/\1\s*>/gi;
const TOKEN = (i: number) => `\u{E000}${i}\u{E000}`;
const TOKEN_RE = /\u{E000}(\d+)\u{E000}/gu;

export const markPlaceholders = (html: string): string => {
  const saved: string[] = [];
  const masked = html.replace(RAW_TEXT, (m) => TOKEN(saved.push(m) - 1));
  return masked
    .split(/(<[^>]*>)/)
    .map((part) => (part.startsWith('<') ? part : part.replace(PLACEHOLDER, (m) => `<mark class="ph">${m}</mark>`)))
    .join('')
    .replace(TOKEN_RE, (_, i: string) => saved[Number(i)] ?? '');
};

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  const type = response.headers.get('content-type') ?? '';
  if (!type.includes('text/html')) return response;
  const html = await response.text();
  return new Response(markPlaceholders(html), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
});
