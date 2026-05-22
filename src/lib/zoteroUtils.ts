export function formatZoteroSourceId(itemKey: string): string {
  return `zotero_${itemKey}`;
}

export function formatZoteroAuthor(creator: {
  firstName?: string;
  lastName?: string;
  name?: string;
}): string {
  if (creator.firstName) {
    return `${creator.firstName} ${creator.lastName ?? ''}`.trim();
  }
  return creator.name ?? 'Unknown';
}
