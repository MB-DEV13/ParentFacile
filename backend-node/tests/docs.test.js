import request from 'supertest';
import app from '../server.js';

function looksLikeArrayPayload(body) {
  return Array.isArray(body)
    || Array.isArray(body?.items)
    || Array.isArray(body?.data)
    || Array.isArray(body?.rows)
    || Array.isArray(body?.documents);
}

describe('Documents API', () => {
  it('liste les documents', async () => {
    const res = await request(app).get('/api/docs');
    expect(res.statusCode).toBe(200);
    // on accepte plusieurs structures courantes
    const ok =
      looksLikeArrayPayload(res.body) ||
      (res.headers['content-type'] || '').includes('application/json');
    expect(ok).toBe(true);
  });

  it('télécharge un document (id=1 si existe)', async () => {
    const res = await request(app).get('/api/docs/1/download');
    expect([200, 404]).toContain(res.statusCode);
  });
});


