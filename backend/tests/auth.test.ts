import request from 'supertest';
import app from '../src/app';
import { prisma } from './setup';
import bcrypt from 'bcrypt';

describe('Auth API', () => {
  const testUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '+77001234567',
  };

  beforeEach(async () => {
    // Clean up users before each test
    await prisma.user.deleteMany({
      where: {
        email: testUser.email,
      },
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.user.deleteMany({
      where: {
        email: testUser.email,
      },
    });
  });

  describe('POST /api/auth/signup', () => {
    it('should signup a new user and return token', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: testUser.fullName,
          email: testUser.email,
          password: testUser.password,
          phone: testUser.phone,
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.fullName).toBe(testUser.fullName);
      expect(response.body.token).toBeTruthy();
      expect(typeof response.body.token).toBe('string');
    });

    it('should not allow duplicate email signup', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: testUser.fullName,
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      // Try to signup again with same email
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Another User',
          email: testUser.email,
          password: 'differentpassword',
        })
        .expect(500); // Should fail with error

      expect(response.body.message).toContain('Email already exists');
    });

    it('should require fullName, email, and password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(400);

      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await prisma.user.create({
        data: {
          fullName: testUser.fullName,
          email: testUser.email,
          passwordHash: hashedPassword,
          phone: testUser.phone,
        },
      });
    });

    it('should login with valid credentials and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.token).toBeTruthy();
      expect(typeof response.body.token).toBe('string');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(500);

      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(500);

      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should require email and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(response.body.message).toContain('required');
    });
  });

  describe('Token Validation - GET /api/users/me', () => {
    let authToken: string;

    beforeEach(async () => {
      // Signup and get token
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: testUser.fullName,
          email: testUser.email,
          password: testUser.password,
          phone: testUser.phone,
        });

      authToken = signupResponse.body.token;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.fullName).toBe(testUser.fullName);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body.message).toContain('authorization');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      expect(response.body.message).toContain('Invalid or expired token');
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.message).toContain('authorization header');
    });
  });

  describe('Full flow: signup -> login -> token validation', () => {
    it('should complete full authentication flow', async () => {
      // Step 1: Signup
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: testUser.fullName,
          email: testUser.email,
          password: testUser.password,
          phone: testUser.phone,
        })
        .expect(201);

      const signupToken = signupResponse.body.token;
      expect(signupToken).toBeTruthy();

      // Step 2: Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const loginToken = loginResponse.body.token;
      expect(loginToken).toBeTruthy();

      // Step 3: Validate token by accessing protected endpoint
      const meResponse = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(meResponse.body.user.email).toBe(testUser.email);
      expect(meResponse.body.user.fullName).toBe(testUser.fullName);
    });
  });
});
