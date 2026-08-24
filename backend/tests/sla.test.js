const { computeSlaStatus, calculateSlaDueAt } = require('../src/services/slaCalculator');

describe('SLA Engine & Dynamic Timestamp Calculation Suite', () => {
  it('should correctly compute target SLA due timestamp based on hours', () => {
    const createdAt = '2026-08-20T10:00:00.000Z';
    const slaDueAt = calculateSlaDueAt(createdAt, 24); // 24 hours
    expect(slaDueAt).toEqual('2026-08-21T10:00:00.000Z');
  });

  it('should mark an active request as OVERDUE if current time > due time', () => {
    const pastDue = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
    const createdAt = new Date(Date.now() - 86400000).toISOString();
    const status = computeSlaStatus({
      created_at: createdAt,
      sla_due_at: pastDue,
      status: 'UNDER_REVIEW',
      target_sla_hours: 24
    });

    expect(status).toEqual('OVERDUE');
  });

  it('should mark completed requests within window as COMPLETED_WITHIN_SLA', () => {
    const futureDue = new Date(Date.now() + 36000000).toISOString();
    const createdAt = new Date(Date.now() - 36000000).toISOString();
    const completedAt = new Date().toISOString();

    const status = computeSlaStatus({
      created_at: createdAt,
      sla_due_at: futureDue,
      completed_at: completedAt,
      status: 'COMPLETED',
      target_sla_hours: 24
    });

    expect(status).toEqual('COMPLETED_WITHIN_SLA');
  });
});
