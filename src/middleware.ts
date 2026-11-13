import { defineMiddleware } from 'astro:middleware';

/**
 * Wraps every visible "[PLACEHOLDER: ...]" in <mark class="ph"> so missing content is
 * impossible to overlook – in Markdown, JSON strings and components alike.
 * Runs at build time only (static output). Text inside tags/attributes, <title>,
 * <script>, <style> and <textarea> is left untouched.
 */
const PLACEHOLDER = /\[PLACEHOLDER:[^\]<]*\]/g;
const RAW_TEXT = /^<(title|script|style|textarea)\b/i;

export const markPlaceholders = (html: string): string => {
  let rawUntil: string | null = null;
  return html
    .split(/(<[^>]*>)/)
    .map((part) => {
      if (part.startsWith('<')) {
        if (rawUntil && part.toLowerCase().startsWith(`</${rawUntil}`)) rawUntil = null;
        else if (!rawUntil) rawUntil = RAW_TEXT.exec(part)?.[1]?.toLowerCase() ?? null;
        return part;
      }
      if (rawUntil) return part;
      return part.replace(PLACEHOLDER, (m) => `<mark class="ph">${m}</mark>`);
    })
    .join('');
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
