import { describe, it, expect } from 'vitest';
import { formatZoteroSourceId, formatZoteroAuthor } from './zoteroUtils';

describe('zoteroUtils', () => {
  it('formatZoteroSourceId uses item key', () => {
    expect(formatZoteroSourceId('ABC123')).toBe('zotero_ABC123');
  });

  it('formatZoteroAuthor joins first and last name', () => {
    expect(formatZoteroAuthor({ firstName: 'Jane', lastName: 'Doe' })).toBe('Jane Doe');
  });

  it('formatZoteroAuthor falls back to name field', () => {
    expect(formatZoteroAuthor({ name: 'Institute X' })).toBe('Institute X');
  });
});
