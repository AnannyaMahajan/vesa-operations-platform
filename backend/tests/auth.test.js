const request = require('supertest');
const app = require('../src/app');
const { getDb } = require('../src/database/db');
const seed = require('../src/database/seed');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await getDb();
  await seed();
});

describe('Authentication API Suite', () => {
  it('should log in successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'aarav.sharma@company.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toEqual('aarav.sharma@company.com');
    expect(res.body.user.role).toEqual('Employee');
  });

  it('should reject login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'aarav.sharma@company.com',
        password: 'WrongPassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error.code).toEqual('INVALID_CREDENTIALS');
  });

  it('should register a new employee account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'new.employee@company.com',
        password: 'Password123!',
        full_name: 'New Test Employee',
        department_id: 1,
        role: 'Employee'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toEqual('new.employee@company.com');
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'aarav.sharma@company.com',
        password: 'Password123!',
        full_name: 'Aarav Sharma Duplicate',
        department_id: 1
      });

    expect(res.statusCode).toEqual(409);
  });
});
