import request from 'supertest';
import express from 'express';

process.env.DB_FILE = ':memory:';
process.env.JWT_SECRET = 'test-secret';

import { runMigrations } from '../src/db';
import bookRoutes from '../src/routes/bookRoutes';
import authRoutes from '../src/routes/authRoutes';
import { authMiddleware } from '../src/middleware/auth';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(authRoutes);
  app.use('/api/books', authMiddleware, bookRoutes);
  return app;
}

beforeAll(() => {
  runMigrations();
});

describe('Auth integration', () => {
  it('logowanie zwraca token i pozwala na dostęp do chronionego endpointu', async () => {
    const app = createApp();

    await request(app)
      .post('/register')
      .send({ login: 'testuser', password: 'Test1234' })
      .expect(201);

    const loginRes = await request(app)
      .post('/login')
      .send({ login: 'testuser', password: 'Test1234' })
      .expect(200);

    const token = loginRes.body.token as string;
    expect(token).toBeDefined();

    await request(app)
      .get('/api/books')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
  });

  it('brak autoryzacji → 401', async () => {
    const app = createApp();

    await request(app)
      .get('/api/books')
      .expect(401);
  });
});
