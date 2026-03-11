import express, { Request, Response } from 'express';
import { Item, getItemsWithOffset, getItemsAfterCursor, getTotalCount, getAllItems } from './db';

const app = express();

// Cursor encoding/decoding
function encodeCursor(id: number, createdAt: string): string {
  const data = JSON.stringify({ id, createdAt });
  return Buffer.from(data).toString('base64');
}

function decodeCursor(cursor: string): { id: number; createdAt: string } | null {
  try {
    const data = Buffer.from(cursor, 'base64').toString('utf-8');
    const parsed = JSON.parse(data);
    if (typeof parsed.id !== 'number' || typeof parsed.createdAt !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// GET /items - Paginated list
app.get('/items', (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
  const cursor = req.query.cursor as string;
  const page = parseInt(req.query.page as string);

  // Cursor-based pagination (when cursor is provided OR no page specified)
  if (cursor || (!page && !cursor)) {
    return handleCursorPagination(req, res, cursor, limit);
  }

  // Offset-based pagination (when page is specified)
  return handleOffsetPagination(req, res, page, limit);
});

function handleOffsetPagination(req: Request, res: Response, page: number, limit: number) {
  const offset = (page - 1) * limit;

  // Get total count
  const total = getTotalCount();
  const totalPages = Math.ceil(total / limit);

  // Get items for this page
  const items = getItemsWithOffset(limit, offset);

  res.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}

function handleCursorPagination(req: Request, res: Response, cursor: string | undefined, limit: number) {
  let items: Item[];

  if (cursor) {
    // Decode cursor
    const cursorData = decodeCursor(cursor);
    if (!cursorData) {
      return res.status(400).json({ error: 'Invalid cursor' });
    }

    // Get items after cursor position (fetch limit + 1 to check hasMore)
    items = getItemsAfterCursor(cursorData.createdAt, cursorData.id, limit + 1);
  } else {
    // First page - no cursor
    const allItems = getAllItems();
    items = allItems.slice(0, limit + 1);
  }

  // Check if there are more items
  const hasMore = items.length > limit;
  if (hasMore) {
    items = items.slice(0, limit); // Remove the extra item
  }

  // Generate next cursor from last item
  const nextCursor = hasMore && items.length > 0
    ? encodeCursor(items[items.length - 1].id, items[items.length - 1].created_at)
    : undefined;

  res.json({
    items,
    pagination: {
      limit,
      hasMore,
      ...(nextCursor && { nextCursor }),
    },
  });
}

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
