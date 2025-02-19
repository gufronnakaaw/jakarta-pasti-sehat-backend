export function getReadingTimeFromHTML(html: string) {
  const wordsPerMinute = 200;
  const plainText = html.replace(/<\/?[^>]+(>|$)/g, '');
  const words = plainText.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} menit waktu baca`;
}

export function getInitials(words: string) {
  return words
    .split(' ')
    .map((word) => word.charAt(0))
    .join('');
}

export function capitalize(words: string) {
  return words
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function slug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function getStatus(start: Date, end: Date) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (now < startDate) return 'Belum dimulai';
  if (now >= startDate && now <= endDate) return 'Berlangsung';
  return 'Berakhir';
}

export function getOrderBy(filter?: string): { created_at: 'desc' | 'asc' } {
  return ['asc', 'desc'].includes(filter)
    ? { created_at: filter as 'desc' | 'asc' }
    : { created_at: 'desc' };
}
