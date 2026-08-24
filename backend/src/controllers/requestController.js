const fs = require('fs');
const path = require('path');
const { query, get, run } = require('../database/db');
const { calculateSlaDueAt, computeSlaStatus } = require('../services/slaCalculator');
const { processWorkflowAction } = require('../services/workflowEngine');
const { logAuditEvent, getAuditLogsForRequest } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

/**
 * Checks whether a user has read/access authorization for a request
 */
function isUserAuthorizedForRequest(request, user) {
  if (!request || !user) return false;

  // System Admin and Ops Manager have org-wide access
  if (user.role === 'System Administrator' || user.role === 'Operations Manager') {
    return true;
  }

  // Requester or Assignee can access
  if (request.requester_id === user.id || request.current_assignee_id === user.id) {
    return true;
  }

  // Managers and Department Staff can access requests within their own department
  if (['Reporting Manager', 'Department Staff', 'Department Head / Director'].includes(user.role)) {
    if (request.department_id === user.department_id) {
      return true;
    }
  }

  return false;
}

async function createRequest(req, res, next) {
  try {
    const user = req.user;
    const { request_type_code, title, priority = 'MEDIUM', payload = {} } = req.body;

    if (!request_type_code || !title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(422).json({
        error: { status: 422, message: 'Missing mandatory request headers: request_type_code and valid title are required.', code: 'VALIDATION_ERROR' }
      });
    }

    if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      return res.status(422).json({
        error: { status: 422, message: 'Invalid priority. Must be one of LOW, MEDIUM, HIGH, URGENT.', code: 'INVALID_PRIORITY' }
      });
    }

    const typeObj = get('SELECT * FROM request_types WHERE code = ?', [request_type_code]);
    if (!typeObj) {
      return res.status(404).json({
        error: { status: 404, message: `Invalid request type code: '${request_type_code}'.`, code: 'INVALID_REQUEST_TYPE' }
      });
    }

    // Workflow Specific Payload & Strict Validation
    if (request_type_code === 'SOFTWARE_ACCESS') {
      if (!payload.software_name || !payload.access_level || !payload.business_justification || !payload.required_date) {
        return res.status(422).json({
          error: { status: 422, message: 'Software Access Requests require: software_name, access_level, business_justification, required_date.', code: 'INVALID_PAYLOAD' }
        });
      }
    } else if (request_type_code === 'EXPENSE_REIMBURSEMENT') {
      const amt = Number(payload.amount);
      if (!payload.expense_category || !payload.expense_date || isNaN(amt) || amt <= 0 || !isFinite(amt) || !payload.business_purpose) {
        return res.status(422).json({
          error: { status: 422, message: 'Expense Reimbursements require: expense_category, valid date, positive numeric amount, business_purpose.', code: 'INVALID_PAYLOAD' }
        });
      }
    } else if (request_type_code === 'DOCUMENT_APPROVAL') {
      if (!payload.document_title || !payload.document_type || !payload.version || !payload.approval_deadline) {
        return res.status(422).json({
          error: { status: 422, message: 'Document Approvals require: document_title, document_type, version, approval_deadline.', code: 'INVALID_PAYLOAD' }
        });
      }
    } else if (request_type_code === 'EQUIPMENT_REQUEST') {
      const qty = Number(payload.quantity);
      if (!payload.equipment_type || isNaN(qty) || !Number.isInteger(qty) || qty <= 0 || !payload.business_justification || !payload.required_date) {
        return res.status(422).json({
          error: { status: 422, message: 'Equipment Requests require: equipment_type, positive integer quantity, business_justification, required_date.', code: 'INVALID_PAYLOAD' }
        });
      }
    }

    // Generate Request Number: REQ-2026-XXXXX
    const countResult = get('SELECT COUNT(*) as total FROM requests');
    const nextSeq = (countResult ? countResult.total : 0) + 10001;
    const requestNumber = `REQ-2026-${String(nextSeq).padStart(5, '0')}`;

    // Target SLA Calculation
    const createdAt = new Date().toISOString();
    const slaDueAt = calculateSlaDueAt(createdAt, typeObj.target_sla_hours);

    // Determine initial assignee (Dept Manager or assigned default)
    const dept = get('SELECT manager_id FROM departments WHERE id = ?', [user.department_id]);
    const initialAssigneeId = (dept && dept.manager_id && dept.manager_id !== user.id) ? dept.manager_id : 2;

    const result = run(`
      INSERT INTO requests (
        request_number, request_type_id, requester_id, department_id, title, priority,
        status, current_assignee_id, current_stage_order, payload_json, sla_due_at, sla_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, 1, ?, ?, 'WITHIN_SLA', ?, ?)
    `, [
      requestNumber,
      typeObj.id,
      user.id,
      user.department_id,
      title.trim(),
      priority,
      initialAssigneeId,
      JSON.stringify(payload),
      slaDueAt,
      createdAt,
      createdAt
    ]);

    const createdReq = get(`
      SELECT r.*, rt.code as type_code, rt.name as type_name, u.full_name as requester_name, d.name as department_name
      FROM requests r
      JOIN request_types rt ON r.request_type_id = rt.id
      JOIN users u ON r.requester_id = u.id
      JOIN departments d ON r.department_id = d.id
      WHERE r.id = ?
    `, [result.lastInsertRowid]);

    logAuditEvent({
      requestId: createdReq.id,
      actorId: user.id,
      action: 'REQUEST_SUBMITTED',
      newState: 'SUBMITTED',
      details: { requestNumber, title, type: request_type_code, priority }
    });

    if (initialAssigneeId) {
      createNotification({
        userId: initialAssigneeId,
        requestId: createdReq.id,
        title: `New Request: ${requestNumber}`,
        message: `${user.full_name} submitted a new ${typeObj.name}: ${title}`,
        type: 'APPROVAL_REQUIRED'
      });
    }

    res.status(201).json({
      message: 'Request successfully submitted.',
      request: {
        ...createdReq,
        payload: JSON.parse(createdReq.payload_json)
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getRequests(req, res, next) {
  try {
    const user = req.user;
    const {
      search,
      request_type_id,
      department_id,
      status,
      priority,
      assignee_id,
      sla_status,
      page = 1,
      limit = 20
    } = req.query;

    let sql = `
      SELECT r.*, rt.code as type_code, rt.name as type_name, rt.target_sla_hours,
             u.full_name as requester_name, u.email as requester_email,
             d.name as department_name, d.code as department_code,
             a.full_name as assignee_name
      FROM requests r
      JOIN request_types rt ON r.request_type_id = rt.id
      JOIN users u ON r.requester_id = u.id
      JOIN departments d ON r.department_id = d.id
      LEFT JOIN users a ON r.current_assignee_id = a.id
      WHERE 1=1
    `;
    const params = [];

    // Strict RBAC Scoping
    if (user.role === 'Employee') {
      sql += ` AND r.requester_id = ?`;
      params.push(user.id);
    } else if (['Reporting Manager', 'Department Staff', 'Department Head / Director'].includes(user.role)) {
      sql += ` AND (r.department_id = ? OR r.requester_id = ? OR r.current_assignee_id = ?)`;
      params.push(user.department_id, user.id, user.id);
    }
    // Admin & Ops Manager see all requests

    // Filters
    if (request_type_id) {
      sql += ` AND r.request_type_id = ?`;
      params.push(request_type_id);
    }
    if (department_id) {
      sql += ` AND r.department_id = ?`;
      params.push(department_id);
    }
    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (priority) {
      sql += ` AND r.priority = ?`;
      params.push(priority);
    }
    if (assignee_id) {
      sql += ` AND r.current_assignee_id = ?`;
      params.push(assignee_id);
    }
    if (sla_status) {
      sql += ` AND r.sla_status = ?`;
      params.push(sla_status);
    }
    if (search) {
      sql += ` AND (r.request_number LIKE ? OR r.title LIKE ? OR u.full_name LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    const countSql = sql.replace(/SELECT r\.\*,[\s\S]*?FROM requests r/, 'SELECT COUNT(*) as count FROM requests r');
    const totalResult = get(countSql, params);
    const total = totalResult ? totalResult.count : 0;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    sql += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const rows = query(sql, params);

    const requests = rows.map(r => {
      const dynamicSla = computeSlaStatus(r);
      if (dynamicSla !== r.sla_status && !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)) {
        run('UPDATE requests SET sla_status = ? WHERE id = ?', [dynamicSla, r.id]);
      }
      return {
        ...r,
        sla_status: dynamicSla,
        payload: JSON.parse(r.payload_json)
      };
    });

    res.json({
      data: requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    const reqId = parseInt(id, 10);
    if (isNaN(reqId) || reqId <= 0) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid request ID. Must be a positive integer.', code: 'INVALID_ID' }
      });
    }

    const request = get(`
      SELECT r.*, rt.code as type_code, rt.name as type_name, rt.target_sla_hours, rt.default_stages_json,
             u.full_name as requester_name, u.email as requester_email, u.role as requester_role,
             d.name as department_name, d.code as department_code,
             a.full_name as assignee_name, a.email as assignee_email
      FROM requests r
      JOIN request_types rt ON r.request_type_id = rt.id
      JOIN users u ON r.requester_id = u.id
      JOIN departments d ON r.department_id = d.id
      LEFT JOIN users a ON r.current_assignee_id = a.id
      WHERE r.id = ?
    `, [id]);

    if (!request) {
      return res.status(404).json({
        error: { status: 404, message: 'Request not found.', code: 'NOT_FOUND' }
      });
    }

    // Strict Authorization Check across all roles
    if (!isUserAuthorizedForRequest(request, user)) {
      return res.status(403).json({
        error: { status: 403, message: 'Access Denied: You do not have permission to view this request.', code: 'FORBIDDEN_REQUEST_ACCESS' }
      });
    }

    const currentSlaStatus = computeSlaStatus(request);

    const approvals = query(`
      SELECT ap.*, u.full_name as approver_name, u.role as approver_role
      FROM approvals ap
      JOIN users u ON ap.approver_id = u.id
      WHERE ap.request_id = ?
      ORDER BY ap.created_at ASC
    `, [id]);

    const comments = query(`
      SELECT c.*, u.full_name as author_name, u.role as author_role, u.email as author_email
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.request_id = ?
      ORDER BY c.created_at ASC
    `, [id]);

    const attachments = query(`
      SELECT att.*, u.full_name as uploader_name
      FROM attachments att
      JOIN users u ON att.uploader_id = u.id
      WHERE att.request_id = ?
      ORDER BY att.created_at DESC
    `, [id]);

    const auditLogs = getAuditLogsForRequest(id);

    res.json({
      request: {
        ...request,
        sla_status: currentSlaStatus,
        payload: JSON.parse(request.payload_json),
        default_stages: JSON.parse(request.default_stages_json)
      },
      approvals,
      comments,
      attachments,
      auditLogs
    });
  } catch (err) {
    next(err);
  }
}

async function executeAction(req, res, next) {
  try {
    const { id } = req.params;
    const { action, comment, next_assignee_id } = req.body;

    const reqId = parseInt(id, 10);
    if (isNaN(reqId) || reqId <= 0) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid request ID. Must be a positive integer.', code: 'INVALID_ID' }
      });
    }

    if (!action) {
      return res.status(422).json({
        error: { status: 422, message: 'Missing mandatory action parameter.', code: 'VALIDATION_ERROR' }
      });
    }

    const updatedRequest = processWorkflowAction({
      requestId: parseInt(id, 10),
      actor: req.user,
      action: action.toUpperCase(),
      comment,
      nextAssigneeId: next_assignee_id ? parseInt(next_assignee_id, 10) : null
    });

    res.json({
      message: `Workflow action '${action}' completed successfully.`,
      request: updatedRequest
    });
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const { id } = req.params;
    const { message, is_internal = 0 } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(422).json({
        error: { status: 422, message: 'Comment message cannot be empty.', code: 'VALIDATION_ERROR' }
      });
    }

    const reqObj = get('SELECT * FROM requests WHERE id = ?', [id]);
    if (!reqObj) {
      return res.status(404).json({ error: { status: 404, message: 'Request not found.', code: 'NOT_FOUND' } });
    }

    // Access Check before commenting
    if (!isUserAuthorizedForRequest(reqObj, req.user)) {
      return res.status(403).json({
        error: { status: 403, message: 'Access Denied: You cannot comment on a request you are not authorized to view.', code: 'FORBIDDEN_COMMENT_ACTION' }
      });
    }

    const result = run(`
      INSERT INTO comments (request_id, author_id, message, is_internal)
      VALUES (?, ?, ?, ?)
    `, [id, req.user.id, message.trim(), is_internal ? 1 : 0]);

    const newComment = get(`
      SELECT c.*, u.full_name as author_name, u.role as author_role
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [result.lastInsertRowid]);

    logAuditEvent({
      requestId: id,
      actorId: req.user.id,
      action: 'COMMENT_ADDED',
      details: { commentId: newComment.id, message: message.trim() }
    });

    res.status(201).json({
      message: 'Comment added successfully.',
      comment: newComment
    });
  } catch (err) {
    next(err);
  }
}

async function addAttachment(req, res, next) {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(422).json({
        error: { status: 422, message: 'No file uploaded or invalid file format.', code: 'VALIDATION_ERROR' }
      });
    }

    const reqObj = get('SELECT * FROM requests WHERE id = ?', [id]);
    if (!reqObj) {
      return res.status(404).json({ error: { status: 404, message: 'Request not found.', code: 'NOT_FOUND' } });
    }

    // Access Check before attaching file
    if (!isUserAuthorizedForRequest(reqObj, req.user)) {
      return res.status(403).json({
        error: { status: 403, message: 'Access Denied: You cannot attach files to a request you are not authorized to view.', code: 'FORBIDDEN_ATTACHMENT_ACTION' }
      });
    }

    const result = run(`
      INSERT INTO attachments (request_id, uploader_id, file_name, original_name, file_path, mime_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, req.user.id, file.filename, file.originalname, file.path, file.mimetype, file.size]);

    const attachment = get(`
      SELECT att.*, u.full_name as uploader_name
      FROM attachments att
      JOIN users u ON att.uploader_id = u.id
      WHERE att.id = ?
    `, [result.lastInsertRowid]);

    logAuditEvent({
      requestId: id,
      actorId: req.user.id,
      action: 'DOCUMENT_UPLOADED',
      details: { fileName: file.originalname, fileSize: file.size }
    });

    res.status(201).json({
      message: 'Attachment uploaded successfully.',
      attachment
    });
  } catch (err) {
    next(err);
  }
}

async function downloadAttachment(req, res, next) {
  try {
    const { attachmentId } = req.params;
    const user = req.user;

    const attachment = get(`
      SELECT att.*, r.requester_id, r.department_id, r.current_assignee_id
      FROM attachments att
      JOIN requests r ON att.request_id = r.id
      WHERE att.id = ?
    `, [attachmentId]);

    if (!attachment) {
      return res.status(404).json({ error: { status: 404, message: 'Attachment not found.', code: 'NOT_FOUND' } });
    }

    // Authorization Check
    const isAuthorized = isUserAuthorizedForRequest({
      requester_id: attachment.requester_id,
      current_assignee_id: attachment.current_assignee_id,
      department_id: attachment.department_id
    }, user) || attachment.uploader_id === user.id;

    if (!isAuthorized) {
      return res.status(403).json({
        error: { status: 403, message: 'Access Denied: You do not have permission to access this attachment.', code: 'FORBIDDEN_DOCUMENT_DOWNLOAD' }
      });
    }

    if (!fs.existsSync(attachment.file_path)) {
      return res.status(404).json({ error: { status: 404, message: 'Physical file not found on server.', code: 'FILE_NOT_FOUND' } });
    }

    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_name}"`);
    fs.createReadStream(attachment.file_path).pipe(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  executeAction,
  addComment,
  addAttachment,
  downloadAttachment
};
