const dateTimeFmt = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (iso) => dateTimeFmt.format(new Date(iso));
export const formatDate = (iso) => dateFmt.format(new Date(iso));

export function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function randomSize() {
  return formatBytes(Math.round(150_000 + Math.random() * 2_800_000));
}

export const lastActivity = (feature) => feature.timeline[feature.timeline.length - 1];

let counter = 0;
export const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${++counter}`;

export const cx = (...classes) => classes.filter(Boolean).join(' ');
