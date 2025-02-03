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
