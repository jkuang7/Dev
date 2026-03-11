// In-memory "database" for the pagination problem

export interface Item {
  id: number;
  name: string;
  created_at: string;
}

// Generate 100 items with sequential timestamps
const items: Item[] = [];
const now = Date.now();

for (let i = 1; i <= 100; i++) {
  const timestamp = new Date(now - (100 - i) * 1000).toISOString();
  items.push({
    id: i,
    name: `Item ${i}`,
    created_at: timestamp,
  });
}

// Sort by created_at ASC, then id ASC
items.sort((a, b) => {
  const dateCompare = a.created_at.localeCompare(b.created_at);
  if (dateCompare !== 0) return dateCompare;
  return a.id - b.id;
});

export function getAllItems(): Item[] {
  return [...items];
}

export function getItemsWithOffset(limit: number, offset: number): Item[] {
  return items.slice(offset, offset + limit);
}

export function getItemsAfterCursor(
  cursorCreatedAt: string,
  cursorId: number,
  limit: number
): Item[] {
  const startIndex = items.findIndex(item => {
    if (item.created_at > cursorCreatedAt) return true;
    if (item.created_at === cursorCreatedAt && item.id > cursorId) return true;
    return false;
  });

  if (startIndex === -1) return [];
  return items.slice(startIndex, startIndex + limit);
}

export function getTotalCount(): number {
  return items.length;
}
