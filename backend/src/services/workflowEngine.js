const { query, get, run } = require('../database/db');
const { computeSlaStatus } = require('./slaCalculator');
const { logAuditEvent } = require('./auditService');
const { createNotification } = require('./notificationService');

const VALID_TRANSITIONS = {
  'SUBMITTED': ['UNDER_REVIEW', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  'UNDER_REVIEW': ['APPROVAL_PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED', 'CANCELLED'],
  'APPROVAL_PENDING': ['APPROVED', 'PROCESSING', 'CHANGES_REQUESTED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
  'APPROVED': ['PROCESSING', 'COMPLETED', 'CANCELLED'],
  'PROCESSING': ['COMPLETED', 'CHANGES_REQUESTED', 'REJECTED', 'CANCELLED'],
  'CHANGES_REQUESTED': ['SUBMITTED', 'UNDER_REVIEW', 'CANCELLED'],
  'OVERDUE': ['APPROVAL_PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED'],
  'COMPLETED': [],
  'REJECTED': [],
  'CANCELLED': []
};

/**
 * Validates whether an actor can execute a transition action on a request
 */
function validateTransitionPermission(request, actor, action) {
  // System Administrator can perform operational overrides if necessary
  if (actor.role === 'System Administrator') {
    return { allowed: true };
  }

  // Rule 1: Self-Approval Prevention
  if (action === 'APPROVE' || action === 'COMPLETE') {
    if (request.requester_id === actor.id) {
      return { allowed: false, message: 'Security Policy Violation: Employees cannot approve or complete their own requests.' };
    }
  }

  const role = actor.role;

  // Rule 2: Department / Assignment Scope Check
  const isAssignee = request.current_assignee_id === actor.id;
  const isSameDepartment = request.department_id === actor.department_id;
  const isOpsManager = role === 'Operations Manager';

  switch (action) {
    case 'APPROVE':
      if (!['Reporting Manager', 'Department Head / Director', 'Operations Manager'].includes(role)) {
        return { allowed: false, message: 'Unauthorized: Your role does not have approval privileges.' };
      }
      if (!isAssignee && !isSameDepartment && !isOpsManager) {
        return { allowed: false, message: 'Unauthorized: You can only approve requests assigned to you or within your department.' };
      }
      break;
    case 'REJECT':
    case 'REQUEST_CHANGES':
      if (!['Reporting Manager', 'Department Staff', 'Department Head / Director', 'Operations Manager'].includes(role)) {
        return { allowed: false, message: 'Unauthorized: Your role cannot reject or request changes on this request.' };
      }
      if (!isAssignee && !isSameDepartment && !isOpsManager) {
        return { allowed: false, message: 'Unauthorized: You can only reject or request changes on requests assigned to you or within your department.' };
      }
      break;
    case 'START_PROCESSING':
    case 'COMPLETE':
      if (!['Department Staff', 'Operations Manager'].includes(role)) {
        return { allowed: false, message: 'Unauthorized: Operational processing tasks can only be executed by Department Staff or Ops Managers.' };
      }
      break;
    case 'CANCEL':
      if (request.requester_id !== actor.id && !['Reporting Manager'].includes(role)) {
        return { allowed: false, message: 'Unauthorized: Only the original requester or reporting manager can cancel this request.' };
      }
      break;
    default:
      return { allowed: false, message: `Unknown workflow action: ${action}` };
  }

  return { allowed: true };
}

/**
 * Executes a transition on a request
 */
function processWorkflowAction({ requestId, actor, action, comment = '', nextAssigneeId = null }) {
  const request = get(`
    SELECT r.*, rt.code as type_code, rt.default_stages_json, rt.target_sla_hours
    FROM requests r
    JOIN request_types rt ON r.request_type_id = rt.id
    WHERE r.id = ?
  `, [requestId]);

  if (!request) {
    throw { status: 404, message: 'Request not found.' };
  }

  // 1. Permission check
  const permCheck = validateTransitionPermission(request, actor, action);
  if (!permCheck.allowed) {
    throw { status: 403, message: permCheck.message };
  }

  // 2. Comment rules
  if ((action === 'REJECT' || action === 'REQUEST_CHANGES') && (!comment || comment.trim().length === 0)) {
    throw { status: 422, message: `A detailed justification comment is mandatory when performing '${action.replace('_', ' ')}'.` };
  }

  const defaultStages = JSON.parse(request.default_stages_json);
  const currentStageIndex = request.current_stage_order;
  const isFinalStage = currentStageIndex >= defaultStages.length;

  let newStatus = request.status;
  let newStageOrder = currentStageIndex;
  let newAssigneeId = request.current_assignee_id;
  let completedAt = request.completed_at;

  switch (action) {
    case 'APPROVE':
      if (isFinalStage) {
        newStatus = 'APPROVED';
        if (['SOFTWARE_ACCESS', 'EXPENSE_REIMBURSEMENT', 'EQUIPMENT_REQUEST'].includes(request.type_code)) {
          newStatus = 'PROCESSING';
        } else {
          newStatus = 'COMPLETED';
          completedAt = new Date().toISOString();
        }
      } else {
        newStatus = 'APPROVAL_PENDING';
        newStageOrder = currentStageIndex + 1;
      }
      break;

    case 'REJECT':
      newStatus = 'REJECTED';
      completedAt = new Date().toISOString();
      break;

    case 'REQUEST_CHANGES':
      newStatus = 'CHANGES_REQUESTED';
      newStageOrder = Math.max(1, currentStageIndex - 1);
      newAssigneeId = request.requester_id; // Reassign back to employee
      break;

    case 'START_PROCESSING':
      newStatus = 'PROCESSING';
      break;

    case 'COMPLETE':
      newStatus = 'COMPLETED';
      completedAt = new Date().toISOString();
      break;

    case 'CANCEL':
      newStatus = 'CANCELLED';
      completedAt = new Date().toISOString();
      break;
  }

  // Check state transition matrix validity
  const allowedNext = VALID_TRANSITIONS[request.status] || [];
  if (!allowedNext.includes(newStatus) && request.status !== newStatus) {
    throw { status: 400, message: `Invalid status transition from '${request.status}' to '${newStatus}'.` };
  }

  if (nextAssigneeId) {
    newAssigneeId = nextAssigneeId;
  }

  // Update SLA Status dynamically
  const updatedSlaStatus = computeSlaStatus({
    created_at: request.created_at,
    sla_due_at: request.sla_due_at,
    completed_at: completedAt,
    status: newStatus,
    target_sla_hours: request.target_sla_hours
  });

  // Database updates
  run(`
    UPDATE requests
    SET status = ?,
        current_stage_order = ?,
        current_assignee_id = ?,
        sla_status = ?,
        completed_at = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [newStatus, newStageOrder, newAssigneeId, updatedSlaStatus, completedAt, requestId]);

  // Record explicit approval entry
  if (['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(action)) {
    const currentStageObj = defaultStages[currentStageIndex - 1] || { name: 'Approval Review' };
    const dbAction = action === 'APPROVE' ? 'APPROVED' : (action === 'REJECT' ? 'REJECTED' : 'CHANGES_REQUESTED');
    run(`
      INSERT INTO approvals (request_id, stage_order, stage_name, approver_id, action, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [requestId, currentStageIndex, currentStageObj.name, actor.id, dbAction, comment || null]);
  }

  // Audit Logging
  logAuditEvent({
    requestId,
    actorId: actor.id,
    action: `WORKFLOW_${action}`,
    previousState: request.status,
    newState: newStatus,
    details: {
      action,
      comment,
      stageOrder: newStageOrder,
      assignedTo: newAssigneeId
    }
  });

  // Notifications
  createNotification({
    userId: request.requester_id,
    requestId,
    title: `Request ${request.request_number} Updated`,
    message: `Your request state changed from ${request.status} to ${newStatus} by ${actor.full_name}.`,
    type: newStatus
  });

  if (newAssigneeId && newAssigneeId !== request.requester_id) {
    createNotification({
      userId: newAssigneeId,
      requestId,
      title: `Task Assigned: ${request.request_number}`,
      message: `Request ${request.request_number} requires your action.`,
      type: 'APPROVAL_REQUIRED'
    });
  }

  return get(`SELECT * FROM requests WHERE id = ?`, [requestId]);
}

module.exports = {
  VALID_TRANSITIONS,
  validateTransitionPermission,
  processWorkflowAction
};
