export function formatClock(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatClock(iso)}`;
}

export function elapsedMinutes(iso: string, now: Date = new Date()): number {
  const then = new Date(iso).getTime();
  return Math.max(0, Math.round((now.getTime() - then) / 60000));
}

export function formatElapsed(iso: string, now: Date = new Date()): string {
  const mins = elapsedMinutes(iso, now);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 24) return rem > 0 ? `${hours} sa ${rem} dk önce` : `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}
