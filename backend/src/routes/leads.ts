import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db';
import { SERVICE_TYPES, Lead } from '../types';

const router = Router();

// --- Validation schema (Zod) ---
// The server is the source of truth for validation.
const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be 10 digits'),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),
  services: z
    .array(z.enum(SERVICE_TYPES))
    .min(1, 'At least one service must be selected'),
});

type LeadRow = Omit<Lead, 'services'> & { services: string };

// --- POST /leads ---
router.post('/', (req: Request, res: Response) => {
  const result = createLeadSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { name, email, mobile, postcode, services } = result.data;

  const insert = db.prepare(`
    INSERT INTO leads (name, email, mobile, postcode, services)
    VALUES (?, ?, ?, ?, ?)
  `);

  const { lastInsertRowid } = insert.run(
    name,
    email,
    mobile,
    postcode,
    JSON.stringify(services),
  );

  const lead = db
    .prepare('SELECT * FROM leads WHERE id = ?')
    .get(lastInsertRowid) as LeadRow;

  return res.status(201).json(parseLead(lead));
});

// --- GET /leads ---
router.get('/', (req: Request, res: Response) => {
  const { service } = req.query;

  let rows: LeadRow[];

  if (service && typeof service === 'string') {
    // Filter: return leads whose services JSON contains the requested service
    rows = db
      .prepare(`SELECT * FROM leads WHERE services LIKE ? ORDER BY created_at DESC`)
      .all(`%"${service}"%`) as LeadRow[];
  } else {
    rows = db
      .prepare('SELECT * FROM leads ORDER BY created_at DESC')
      .all() as LeadRow[];
  }

  return res.json(rows.map(parseLead));
});

// Helper: SQLite stores services as a JSON string; parse it back to an array
function parseLead(row: LeadRow): Lead {
  return {
    ...row,
    services: JSON.parse(row.services),
  };
}

export default router;
