/** Escape a value for CSV (RFC 4180) */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return escapeCsvCell(value);
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return escapeCsvCell(String(value));
  }
  return escapeCsvCell(JSON.stringify(value));
}

function escapeCsvCell(str: string): string {
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(',');
}
