const request = require('supertest');
const app = require('../src/app');
const { getDb } = require('../src/database/db');
const seed = require('../src/database/seed');
const path = require('path');
const fs = require('fs');

let employeeToken;
let unauthorizedToken;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await getDb();
  await seed();

  // Employee 1: Aarav Sharma (Requester of request 1)
  const empLogin = await request(app).post('/api/auth/login').send({ email: 'aarav.sharma@company.com', password: 'Password123!' });
  employeeToken = empLogin.body.token;

  // Employee 3: Ananya Roy (HR, unauthorized for IT request 3 unless authorized)
  const unauthLogin = await request(app).post('/api/auth/login').send({ email: 'ananya.roy@company.com', password: 'Password123!' });
  unauthorizedToken = unauthLogin.body.token;
});

describe('File Attachment API & Authorization Test Suite', () => {
  it('1. Upload valid document to authorized request -> PASS (201)', async () => {
    const testFilePath = path.join(__dirname, 'sample.txt');
    fs.writeFileSync(testFilePath, 'Sample test attachment content for pre-submission QA pass.');

    const res = await request(app)
      .post('/api/requests/1/attachments')
      .set('Authorization', `Bearer ${employeeToken}`)
      .attach('file', testFilePath);

    fs.unlinkSync(testFilePath);

    expect(res.statusCode).toEqual(201);
    expect(res.body.attachment).toBeDefined();
    expect(res.body.attachment.original_name).toEqual('sample.txt');
  });

  it('2. Upload attachment to an unauthorized request -> BLOCKED (403)', async () => {
    const testFilePath = path.join(__dirname, 'unauthorized_sample.txt');
    fs.writeFileSync(testFilePath, 'Unauthorized file upload content');

    const res = await request(app)
      .post('/api/requests/3/attachments')
      .set('Authorization', `Bearer ${employeeToken}`)
      .attach('file', testFilePath);

    fs.unlinkSync(testFilePath);

    expect(res.statusCode).toEqual(403);
    expect(res.body.error.code).toEqual('FORBIDDEN_ATTACHMENT_ACTION');
  });

  it('3. Reject upload without a file -> BLOCKED (422)', async () => {
    const res = await request(app)
      .post('/api/requests/1/attachments')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toEqual(422);
    expect(res.body.error.code).toEqual('VALIDATION_ERROR');
  });

  it('4. Download attachment for authorized user -> PASS (200)', async () => {
    const res = await request(app)
      .get('/api/requests/attachments/1/download')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toEqual(200);
  });
});
