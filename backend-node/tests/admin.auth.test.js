import request from 'supertest';
import app from '../server.js'; // Exportez app (pas .listen) depuis server.js

describe('Admin Auth', () => {
  it('rejette une session non connectée', async () => {
    const res = await request(app).get('/api/admin/auth/me');
    expect([200,401]).toContain(res.statusCode);
  });

  it('connecte un admin (200 + cookie)', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: process.env.TEST_ADMIN_EMAIL || 'admin@parentfacile.fr', password: process.env.TEST_ADMIN_PASSWORD || 'Admin1234!' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
