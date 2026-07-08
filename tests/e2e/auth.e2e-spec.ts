import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../backend/src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const email = `test-${Date.now()}@example.com`;
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: 'Password123!', name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.data.message).toBe('Registration successful. Please verify your email.');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'admin@adsphere.io', password: 'Password123!' });

      expect(res.status).toBe(409);
    });

    it('should reject invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'invalid', password: 'Password123!' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@adsphere.io', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@adsphere.io', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });
  });
});
