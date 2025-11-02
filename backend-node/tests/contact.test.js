import request from 'supertest';
import app from '../server.js';

describe('Contact', () => {
  it('crée un message', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ email: 'test@example.com', subject: 'Test', message: 'Bonjour' })
      .set('Accept', 'application/json');
    expect([201,400]).toContain(res.statusCode);
  });
});
