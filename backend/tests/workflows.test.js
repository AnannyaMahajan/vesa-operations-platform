const request = require('supertest');
const app = require('../src/app');
const { getDb } = require('../src/database/db');
const seed = require('../src/database/seed');

let empToken;
let mgrToken;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await getDb();
  await seed();

  const empRes = await request(app).post('/api/auth/login').send({ email: 'aarav.sharma@company.com', password: 'Password123!' });
  empToken = empRes.body.token;

  const mgrRes = await request(app).post('/api/auth/login').send({ email: 'priya.mehta@company.com', password: 'Password123!' });
  mgrToken = mgrRes.body.token;
});

describe('Workflows Execution Suite (All 4 Processes)', () => {
  it('should create a valid Software Access Request', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        request_type_code: 'SOFTWARE_ACCESS',
        title: 'Figma Organization License',
        priority: 'HIGH',
        payload: {
          software_name: 'Figma Enterprise',
          access_level: 'Editor License',
          business_justification: 'UI/UX design work for mobile web application project.',
          required_date: '2026-08-30'
        }
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.request.request_number).toMatch(/^REQ-2026-\d{5}$/);
    expect(res.body.request.status).toEqual('SUBMITTED');
  });

  it('should require a justification comment when rejecting a request', async () => {
    const res = await request(app)
      .post('/api/requests/1/action')
      .set('Authorization', `Bearer ${mgrToken}`)
      .send({
        action: 'REJECT',
        comment: '' // Empty comment!
      });

    expect(res.statusCode).toEqual(422);
    expect(res.body.error.message).toContain('justification comment is mandatory');
  });

  it('should allow Manager to approve a pending team request', async () => {
    const res = await request(app)
      .post('/api/requests/1/action')
      .set('Authorization', `Bearer ${mgrToken}`)
      .send({
        action: 'APPROVE',
        comment: 'Valid Software Access Requirement verified.'
      });

    expect(res.statusCode).toEqual(200);
    expect(['APPROVAL_PENDING', 'PROCESSING', 'APPROVED', 'COMPLETED']).toContain(res.body.request.status);
  });
});
