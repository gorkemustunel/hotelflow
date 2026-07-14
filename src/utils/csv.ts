function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
}

/** Triggers a browser download of `rows` as a CSV file. A UTF-8 BOM is
 * prepended so Excel (which otherwise guesses the wrong encoding) renders
 * Turkish characters correctly on first open. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = toCsv(rows);
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
