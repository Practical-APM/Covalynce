export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

export function resolveDateRange(range = 'mtd'): DateRange {
  const now = new Date();
  let from = new Date(now);
  let to = new Date(now);
  to.setUTCHours(23, 59, 59, 999);

  switch (range) {
    case '7d':
      from.setUTCDate(from.getUTCDate() - 6);
      from.setUTCHours(0, 0, 0, 0);
      break;
    case '30d':
      from.setUTCDate(from.getUTCDate() - 29);
      from.setUTCHours(0, 0, 0, 0);
      break;
    case 'last_month': {
      from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      to = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999),
      );
      break;
    }
    case 'mtd':
    default:
      from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      from.setUTCHours(0, 0, 0, 0);
      break;
  }

  return { from, to, label: range };
}

export function timestampFilter(range: DateRange) {
  return { gte: range.from, lte: range.to };
}
