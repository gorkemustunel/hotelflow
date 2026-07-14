import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('joins cells with commas and rows with CRLF', () => {
    const csv = toCsv([
      ['Oda', 'Talep'],
      ['101', 'Temizlik'],
    ]);
    expect(csv).toBe('Oda,Talep\r\n101,Temizlik');
  });

  it('quotes cells containing commas, quotes, or newlines', () => {
    const csv = toCsv([['Kerem, Öztürk', 'Not: "acil"', 'satır\nsonu']]);
    expect(csv).toBe('"Kerem, Öztürk","Not: ""acil""","satır\nsonu"');
  });

  it('leaves plain numbers and strings unquoted', () => {
    const csv = toCsv([[101, 'Temizlik', 250.5]]);
    expect(csv).toBe('101,Temizlik,250.5');
  });

  it('handles an empty table', () => {
    expect(toCsv([])).toBe('');
  });
});
