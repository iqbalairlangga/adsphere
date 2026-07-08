export function formatDate(date: Date, format: 'iso' | 'short' | 'full' = 'iso'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    case 'full':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return date.toISOString();
  }
}

export function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / msPerDay);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}
