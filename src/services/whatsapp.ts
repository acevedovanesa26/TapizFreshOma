/**
 * Formats a phone number for Colombia (+57) and returns a clean WhatsApp wa.me link
 * Default business phone: 3219918147
 */
export const TAPIZ_FRESH_PHONE = '3219918147';
export const TAPIZ_FRESH_PHONE_FORMATTED = '321 991 8147';

export function formatWhatsAppNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (!clean) return `57${TAPIZ_FRESH_PHONE}`;
  if (clean.startsWith('57') && clean.length >= 12) {
    return clean;
  }
  if (clean.length === 10 && clean.startsWith('3')) {
    return `57${clean}`;
  }
  return clean.length >= 10 ? `57${clean}` : `57${clean}`;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const formattedNumber = formatWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${formattedNumber}?text=${encoded}`;
}

export function openWhatsAppChat(phone: string, message: string): void {
  const link = buildWhatsAppLink(phone, message);
  if (typeof window !== 'undefined' && link) {
    window.open(link, '_blank', 'noopener,noreferrer');
  }
}
