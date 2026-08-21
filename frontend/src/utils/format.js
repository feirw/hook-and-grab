export function mediaSrc(image) {
  if (!image || !image.data) return null;
  return `data:${image.mimeType || 'image/jpeg'};base64,${image.data}`;
}

export function formatPrice(value) {
  const amount = Number(value) || 0;
  return `${amount.toFixed(2)}€`;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export function relativeTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}hr`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}
