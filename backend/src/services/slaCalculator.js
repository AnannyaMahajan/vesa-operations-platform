/**
 * VESA Enterprise SLA Dynamic Calculation Engine
 */

function calculateSlaDueAt(createdAt, targetSlaHours) {
  const createdDate = new Date(createdAt);
  const dueMs = createdDate.getTime() + (targetSlaHours * 60 * 60 * 1000);
  return new Date(dueMs).toISOString();
}

function computeSlaStatus(request) {
  const { created_at, sla_due_at, completed_at, status, target_sla_hours } = request;
  const now = new Date();
  const dueDate = new Date(sla_due_at);
  const createdDate = new Date(created_at);

  const isTerminal = ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(status);

  if (isTerminal) {
    if (status === 'COMPLETED') {
      const completionTime = completed_at ? new Date(completed_at) : now;
      return completionTime <= dueDate ? 'COMPLETED_WITHIN_SLA' : 'COMPLETED_AFTER_SLA';
    }
    // Rejected/Cancelled requests retain SLA status at moment of termination
    const endPoint = completed_at ? new Date(completed_at) : now;
    return endPoint <= dueDate ? 'WITHIN_SLA' : 'OVERDUE';
  }

  // Active requests
  if (now > dueDate) {
    return 'OVERDUE';
  }

  // Approaching SLA if remaining time is <= 25% of overall SLA window
  const totalWindowMs = target_sla_hours ? (target_sla_hours * 60 * 60 * 1000) : (dueDate.getTime() - createdDate.getTime());
  const remainingMs = dueDate.getTime() - now.getTime();

  if (remainingMs <= totalWindowMs * 0.25) {
    return 'APPROACHING_SLA';
  }

  return 'WITHIN_SLA';
}

function calculateHoursRemaining(slaDueAt) {
  const now = new Date();
  const dueDate = new Date(slaDueAt);
  const diffMs = dueDate.getTime() - now.getTime();
  return (diffMs / (1000 * 60 * 60)).toFixed(1);
}

module.exports = {
  calculateSlaDueAt,
  computeSlaStatus,
  calculateHoursRemaining
};
