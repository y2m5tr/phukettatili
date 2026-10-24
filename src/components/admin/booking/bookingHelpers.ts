/**
 * 2'li saat aralığını (Örn: "08:30 - 09:00" veya "07:30") başlangıç ve bitiş olarak ayrıştırır.
 */
export function parsePickupRange(val?: string): { start: string; end: string } {
  if (!val) return { start: '07:30', end: '07:45' };
  const clean = val.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-').map((s) => s.trim());
    return {
      start: parts[0] || '07:30',
      end: parts[1] || '07:45',
    };
  }
  return {
    start: clean,
    end: addMinutesToTime(clean, 15),
  };
}

export function addMinutesToTime(timeStr: string, mins: number): string {
  if (!timeStr || !timeStr.includes(':')) return '07:45';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return '07:45';
  const total = (h * 60 + m + mins) % (24 * 60);
  const newH = Math.floor(total / 60).toString().padStart(2, '0');
  const newM = (total % 60).toString().padStart(2, '0');
  return `${newH}:${newM}`;
}
