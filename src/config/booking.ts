/**
 * Booking configuration – the ONLY place where prices and Stripe Payment Links live.
 *
 * How to go live with a program option:
 *   1. In Stripe: Product catalogue → create a product + price → "Create payment link".
 *   2. Paste the link (https://buy.stripe.com/...) into `paymentLink` below and set `price`.
 *   3. Once durations and prices of a program are final, set `confirmed: true`.
 *
 * Links containing "PLACEHOLDER" are rendered as "not open yet" and are never clickable.
 *
 * Everything below is PLACEHOLDER data – programs, durations, prices and currency are
 * open questions (see CLAUDE.md).
 */

export const programIds = ['shaolin', 'taichi', 'mma', 'wingchun'] as const;
export type ProgramId = (typeof programIds)[number];

export interface BookingOption {
  /** stable id, used in anchors, e.g. "shaolin-4w" */
  id: string;
  /** length of stay in weeks */
  weeks: number;
  /** price in major units of CURRENCY (e.g. 980 = 980.00); null = not decided */
  price: number | null;
  /** Stripe Payment Link */
  paymentLink: string;
}

export interface ProgramBooking {
  id: ProgramId;
  /** false while durations/prices are drafts – the site shows a placeholder notice */
  confirmed: boolean;
  options: BookingOption[];
}

/** ISO 4217 code. [PLACEHOLDER: currency not decided] */
export const CURRENCY = 'USD';
export const CURRENCY_CONFIRMED = false;

const placeholderOptions = (program: ProgramId): BookingOption[] =>
  [1, 2, 4, 12].map((weeks) => ({
    id: `${program}-${weeks}w`,
    weeks,
    price: null,
    paymentLink: `https://buy.stripe.com/PLACEHOLDER-${program}-${weeks}w`,
  }));

export const bookings: ProgramBooking[] = [
  { id: 'shaolin', confirmed: false, options: placeholderOptions('shaolin') },
  { id: 'taichi', confirmed: false, options: placeholderOptions('taichi') },
  { id: 'mma', confirmed: false, options: placeholderOptions('mma') },
  { id: 'wingchun', confirmed: false, options: placeholderOptions('wingchun') },
];

export const getBooking = (id: ProgramId): ProgramBooking => {
  const booking = bookings.find((b) => b.id === id);
  if (!booking) throw new Error(`No booking config for program "${id}"`);
  return booking;
};

export const isLiveLink = (url: string): boolean =>
  url.startsWith('https://buy.stripe.com/') && !url.includes('PLACEHOLDER');

export const formatPrice = (price: number, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 }).format(price);

/** Lowest known price of a program, for "from …" labels. */
export const fromPrice = (id: ProgramId): number | null => {
  const prices = getBooking(id)
    .options.map((o) => o.price)
    .filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
};
