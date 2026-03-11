import express, { Request, Response } from 'express';
import { Item, getItemsWithOffset, getItemsAfterCursor, getTotalCount, getAllItems } from './db';

const app = express();

// GET /items - Paginated list
// Supports both offset and cursor pagination
//
// Offset: ?page=1&limit=10
// Cursor: ?cursor=abc123&limit=10
app.get('/items', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const cursor = req.query.cursor as string;
  const page = parseInt(req.query.page as string);

  // TODO: Implement pagination
  // If cursor is provided, use cursor-based pagination
  // If page is provided, use offset-based pagination
  // Default to cursor pagination (no page param)

  // TODO: For cursor pagination:
  // - If cursor provided, decode to get {id, created_at}
  // - Use getItemsAfterCursor(created_at, id, limit + 1)
  // - Check hasMore by fetching limit + 1 items
  // - Return {items, pagination: {limit, hasMore, nextCursor?}}

  // TODO: For offset pagination:
  // - Calculate offset = (page - 1) * limit
  // - Use getItemsWithOffset(limit, offset)
  // - Use getTotalCount() for total
  // - Return {items, pagination: {page, limit, total, totalPages}}

  res.status(501).json({ error: 'Not implemented' });
});

// Helper functions you'll need:

// Encode cursor to base64
function encodeCursor(id: number, createdAt: string): string {
  // TODO: Implement
  return '';
}

// Decode cursor from base64
function decodeCursor(cursor: string): { id: number; createdAt: string } | null {
  // TODO: Implement
  return null;
}

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
