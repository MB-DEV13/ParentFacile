import { pool } from '../server.js';

export default async function globalTeardown() {
  try { await pool.end(); } catch (e) {}
}
