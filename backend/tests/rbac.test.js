const request = require('supertest');
const app = require('../src/app');
const { getDb } = require('../src/database/db');
const seed = require('../src/database/seed');

let employeeToken;
let managerToken;
let staffToken;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await getDb();
  await seed();

  const empLogin = await request(app).post('/api/auth/login').send({ email: 'aarav.sharma@company.com', password: 'Password123!' });
  employeeToken = empLogin.body.token;

  const mgrLogin = await request(app).post('/api/auth/login').send({ email: 'priya.mehta@company.com', password: 'Password123!' });
  managerToken = mgrLogin.body.token;

  const staffLogin = await request(app).post('/api/auth/login').send({ email: 'vikram.singh@company.com', password: 'Password123!' });
  staffToken = staffLogin.body.token;
});

describe('Security & RBAC Comprehensive Audit Test Suite', () => {
  it('1. Employee accessing own request -> PASS', async () => {
    const res = await request(app)
      .get('/api/requests/1')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.request.id).toEqual(1);
  });

  it("2. Employee accessing another employee's private request -> BLOCKED (403)", async () => {
    const res = await request(app)
      .get('/api/requests/3')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.error.code).toEqual('FORBIDDEN_REQUEST_ACCESS');
  });

  it('3. Manager accessing team/department request -> PASS', async () => {
    const res = await request(app)
      .get('/api/requests/1')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toEqual(200);
  });

  it("4. Manager accessing another department's private request -> BLOCKED (403)", async () => {
    const res = await request(app)
      .get('/api/requests/3')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.error.code).toEqual('FORBIDDEN_REQUEST_ACCESS');
  });

  it('5. PREVENT an Employee from approving their own request (Self-Approval Guard)', async () => {
    const res = await request(app)
      .post('/api/requests/1/action')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        action: 'APPROVE',
        comment: 'Self approving my request'
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body.error.message).toContain('Employees cannot approve or complete their own requests');
  });

  it('6. REJECT non-admin user trying to invoke System Admin endpoint -> BLOCKED (403)', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.error.code).toEqual('FORBIDDEN_ROLE');
  });

  it('7. REJECT unauthenticated direct API access -> BLOCKED (401)', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.statusCode).toEqual(401);
  });

  it('8. REJECT negative or NaN amount in Expense Reimbursement -> BLOCKED (422)', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        request_type_code: 'EXPENSE_REIMBURSEMENT',
        title: 'Negative Expense Test',
        payload: {
          expense_category: 'Client Meeting & Travel',
          expense_date: '2026-08-20',
          amount: -500,
          business_purpose: 'Dinner'
        }
      });

    expect(res.statusCode).toEqual(422);
    expect(res.body.error.code).toEqual('INVALID_PAYLOAD');
  });

  it('9. REJECT negative or fractional quantity in Equipment Request -> BLOCKED (422)', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        request_type_code: 'EQUIPMENT_REQUEST',
        title: 'Fractional Equipment Test',
        payload: {
          equipment_type: 'External Monitor',
          quantity: 1.5,
          business_justification: 'Testing',
          required_date: '2026-08-25'
        }
      });

    expect(res.statusCode).toEqual(422);
    expect(res.body.error.code).toEqual('INVALID_PAYLOAD');
  });

  it('10. REJECT illegal workflow state transitions -> BLOCKED (400)', async () => {
    // REQ 4 is already COMPLETED. Staff Vikram trying to execute START_PROCESSING should fail state matrix (400)!
    const res = await request(app)
      .post('/api/requests/4/action')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        action: 'START_PROCESSING'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toContain('Invalid status transition');
  });
});
