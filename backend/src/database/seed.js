const bcrypt = require('bcryptjs');
const { getDb, exec, run } = require('./db');

async function seed() {
  console.log('🌱 Starting VESA Database Seeding...');

  // Initialize DB instance
  await getDb();

  // Clear existing tables in correct dependency order
  exec(`
    DELETE FROM audit_logs;
    DELETE FROM notifications;
    DELETE FROM attachments;
    DELETE FROM comments;
    DELETE FROM approvals;
    DELETE FROM requests;
    DELETE FROM request_types;
    DELETE FROM users;
    DELETE FROM departments;
  `);

  // 1. Departments
  run('INSERT INTO departments (id, name, code) VALUES (?, ?, ?)', [1, 'Product Engineering', 'ENG']);
  run('INSERT INTO departments (id, name, code) VALUES (?, ?, ?)', [2, 'Marketing & Growth', 'MKT']);
  run('INSERT INTO departments (id, name, code) VALUES (?, ?, ?)', [3, 'Operations & Logistics', 'OPS']);
  run('INSERT INTO departments (id, name, code) VALUES (?, ?, ?)', [4, 'Finance & Accounting', 'FIN']);
  run('INSERT INTO departments (id, name, code) VALUES (?, ?, ?)', [5, 'IT & Infrastructure', 'IT']);
  run('INSERT INTO departments (id, name, code) VALUES (?, ?, ?)', [6, 'Human Resources', 'HR']);

  // Common hashed password for seed accounts: "Password123!"
  const passwordHash = bcrypt.hashSync('Password123!', 10);

  // 2. Users (Representing all 6 VESA roles)
  const users = [
    [1, 'aarav.sharma@company.com', passwordHash, 'Aarav Sharma', 'Employee', 1],
    [2, 'priya.mehta@company.com', passwordHash, 'Priya Mehta', 'Reporting Manager', 1],
    [3, 'vikram.singh@company.com', passwordHash, 'Vikram Singh', 'Department Staff', 5],
    [4, 'elena.rodriguez@company.com', passwordHash, 'Elena Rodriguez', 'Department Head / Director', 1],
    [5, 'alex.chen@company.com', passwordHash, 'Alex Chen', 'System Administrator', 5],
    [6, 'sarah.jenkins@company.com', passwordHash, 'Sarah Jenkins', 'Operations Manager', 3],
    [7, 'finance.officer@company.com', passwordHash, 'Rohan Patel (Finance)', 'Department Staff', 4],
    [8, 'neha.verma@company.com', passwordHash, 'Neha Verma', 'Employee', 3]
  ];

  for (const u of users) {
    run(`
      INSERT INTO users (id, email, password_hash, full_name, role, department_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
    `, u);
  }

  run('UPDATE departments SET manager_id = 2 WHERE id = 1');
  run('UPDATE departments SET manager_id = 2 WHERE id = 3');

  // 3. Request Types
  run(`
    INSERT INTO request_types (id, code, name, description, target_sla_hours, default_stages_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    1,
    'SOFTWARE_ACCESS',
    'Software Access Request',
    'Request access credentials or license for internal software systems.',
    24,
    JSON.stringify([
      { stage: 1, name: 'Reporting Manager Review', role: 'Reporting Manager' },
      { stage: 2, name: 'IT Administrator Provisioning', role: 'Department Staff' }
    ])
  ]);

  run(`
    INSERT INTO request_types (id, code, name, description, target_sla_hours, default_stages_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    2,
    'EXPENSE_REIMBURSEMENT',
    'Expense Reimbursement',
    'Submit business expenses and receipt proof for departmental reimbursement.',
    48,
    JSON.stringify([
      { stage: 1, name: 'Manager Justification Review', role: 'Reporting Manager' },
      { stage: 2, name: 'Finance Verification', role: 'Department Staff' },
      { stage: 3, name: 'Reimbursement Processing', role: 'Department Staff' }
    ])
  ]);

  run(`
    INSERT INTO request_types (id, code, name, description, target_sla_hours, default_stages_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    3,
    'DOCUMENT_APPROVAL',
    'Document Approval',
    'Formal review and sign-off for organizational policies, specs, or contracts.',
    72,
    JSON.stringify([
      { stage: 1, name: 'Department Manager Review', role: 'Reporting Manager' },
      { stage: 2, name: 'Department Director Final Sign-off', role: 'Department Head / Director' }
    ])
  ]);

  run(`
    INSERT INTO request_types (id, code, name, description, target_sla_hours, default_stages_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    4,
    'EQUIPMENT_REQUEST',
    'Equipment Request',
    'Request hardware devices, accessories, or office equipment.',
    72,
    JSON.stringify([
      { stage: 1, name: 'Reporting Manager Approval', role: 'Reporting Manager' },
      { stage: 2, name: 'IT/Admin Availability Check', role: 'Department Staff' },
      { stage: 3, name: 'Procurement or Inventory Allocation', role: 'Department Staff' }
    ])
  ]);

  // 4. Sample Seed Requests
  const now = new Date();
  const minusHours = (h) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
  const plusHours = (h) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();

  // REQ 1: Software Access
  run(`
    INSERT INTO requests (
      id, request_number, request_type_id, requester_id, department_id, title, priority, status,
      current_assignee_id, current_stage_order, payload_json, sla_due_at, sla_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    1,
    'REQ-2026-00001',
    1, 1, 1,
    'Access to Jira & Confluence License',
    'HIGH',
    'UNDER_REVIEW',
    2, 1,
    JSON.stringify({
      software_name: 'Project Management Suite (Jira & Confluence)',
      access_level: 'Standard User',
      business_justification: 'Required for sprint planning and cross-team project coordination on Q3 initiatives.',
      required_date: '2026-08-25',
      additional_comments: 'Urgent onboarding requirement for new project module.'
    }),
    plusHours(18), 'WITHIN_SLA', minusHours(6), minusHours(6)
  ]);

  // REQ 2: Expense Reimbursement
  run(`
    INSERT INTO requests (
      id, request_number, request_type_id, requester_id, department_id, title, priority, status,
      current_assignee_id, current_stage_order, payload_json, sla_due_at, sla_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    2,
    'REQ-2026-00002',
    2, 2, 2,
    'Client Meeting Expense - Bangalore Summit',
    'MEDIUM',
    'APPROVAL_PENDING',
    7, 2,
    JSON.stringify({
      expense_category: 'Client Meeting & Travel',
      expense_date: '2026-08-18',
      amount: 4850,
      description: 'Dinner meeting with Enterprise partner representatives and taxi fare.',
      business_purpose: 'Closing Annual Enterprise SLA Renewal Contract.',
      receipt_attached: true
    }),
    plusHours(30), 'WITHIN_SLA', minusHours(18), minusHours(2)
  ]);

  // REQ 3: Document Approval (Overdue)
  run(`
    INSERT INTO requests (
      id, request_number, request_type_id, requester_id, department_id, title, priority, status,
      current_assignee_id, current_stage_order, payload_json, sla_due_at, sla_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    3,
    'REQ-2026-00003',
    3, 8, 3,
    'Customer Data Handling Procedure v1.2',
    'URGENT',
    'APPROVAL_PENDING',
    4, 2,
    JSON.stringify({
      document_title: 'Customer Data Handling & Compliance Standard',
      document_type: 'Internal Policy Standard',
      version: '1.2',
      approval_deadline: '2026-08-26',
      description: 'Updated guidelines aligning with GDPR and SOC2 compliance standards.'
    }),
    minusHours(5), 'OVERDUE', minusHours(80), minusHours(12)
  ]);

  // REQ 4: Equipment Request (Completed)
  run(`
    INSERT INTO requests (
      id, request_number, request_type_id, requester_id, department_id, title, priority, status,
      current_assignee_id, current_stage_order, payload_json, sla_due_at, sla_status, created_at, updated_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    4,
    'REQ-2026-00004',
    4, 1, 1,
    'Dual 4K External Monitor for Development',
    'MEDIUM',
    'COMPLETED',
    3, 3,
    JSON.stringify({
      equipment_type: 'External Monitor (27-inch 4K)',
      quantity: 1,
      business_justification: 'Required for split-screen frontend layout debugging and micro-frontend testing.',
      required_date: '2026-08-20',
      allocation_status: 'Allocated from IT Inventory - Tag #DEV-MON-891'
    }),
    plusHours(40), 'COMPLETED_WITHIN_SLA', minusHours(48), minusHours(4), minusHours(4)
  ]);

  // 5. Approvals
  run('INSERT INTO approvals (request_id, stage_order, stage_name, approver_id, action, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [2, 1, 'Manager Justification Review', 4, 'APPROVED', 'Expense verified against Q3 marketing client budget.', minusHours(2)]);
  run('INSERT INTO approvals (request_id, stage_order, stage_name, approver_id, action, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [3, 1, 'Department Manager Review', 2, 'APPROVED', 'Policy structure looks solid. Forwarding for Director sign-off.', minusHours(12)]);
  run('INSERT INTO approvals (request_id, stage_order, stage_name, approver_id, action, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [4, 1, 'Reporting Manager Approval', 2, 'APPROVED', 'Approved for engineering team setup.', minusHours(36)]);
  run('INSERT INTO approvals (request_id, stage_order, stage_name, approver_id, action, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [4, 2, 'IT/Admin Availability Check', 3, 'APPROVED', 'Item available in IT Storage Bay B.', minusHours(10)]);
  run('INSERT INTO approvals (request_id, stage_order, stage_name, approver_id, action, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [4, 3, 'Procurement or Inventory Allocation', 3, 'APPROVED', 'Issued monitor Tag #DEV-MON-891 to Aarav Sharma.', minusHours(4)]);

  // 6. Comments
  run('INSERT INTO comments (request_id, author_id, message, is_internal, created_at) VALUES (?, ?, ?, ?, ?)',
    [1, 1, 'Please grant admin permissions if possible.', 0, minusHours(6)]);
  run('INSERT INTO comments (request_id, author_id, message, is_internal, created_at) VALUES (?, ?, ?, ?, ?)',
    [2, 7, 'Please upload the itemized food invoice alongside the total receipt.', 0, minusHours(1)]);

  // 7. Notifications
  run('INSERT INTO notifications (user_id, request_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [2, 1, 'Approval Required', 'Aarav Sharma submitted a Software Access Request: Access to Jira & Confluence License', 'APPROVAL_REQUIRED', 0, minusHours(6)]);
  run('INSERT INTO notifications (user_id, request_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [7, 2, 'Action Required', 'Priya Mehta submitted Expense Reimbursement REQ-2026-00002 for verification', 'APPROVAL_REQUIRED', 0, minusHours(2)]);
  run('INSERT INTO notifications (user_id, request_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [4, 3, 'Final Approval Needed', 'Document Approval REQ-2026-00003 is awaiting your final sign-off (OVERDUE)', 'SLA_WARNING', 0, minusHours(5)]);

  // 8. Audit Logs
  run('INSERT INTO audit_logs (request_id, actor_id, action, previous_state, new_state, details_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [1, 1, 'REQUEST_SUBMITTED', null, 'UNDER_REVIEW', JSON.stringify({ priority: 'HIGH', type: 'SOFTWARE_ACCESS' }), minusHours(6)]);
  run('INSERT INTO audit_logs (request_id, actor_id, action, previous_state, new_state, details_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [2, 2, 'REQUEST_SUBMITTED', null, 'SUBMITTED', JSON.stringify({ amount: 4850 }), minusHours(18)]);
  run('INSERT INTO audit_logs (request_id, actor_id, action, previous_state, new_state, details_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [2, 4, 'APPROVAL_GRANTED', 'SUBMITTED', 'APPROVAL_PENDING', JSON.stringify({ stage: 1, comment: 'Expense verified' }), minusHours(2)]);
  run('INSERT INTO audit_logs (request_id, actor_id, action, previous_state, new_state, details_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [4, 1, 'REQUEST_SUBMITTED', null, 'SUBMITTED', JSON.stringify({ item: 'External Monitor' }), minusHours(48)]);
  run('INSERT INTO audit_logs (request_id, actor_id, action, previous_state, new_state, details_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [4, 3, 'REQUEST_COMPLETED', 'PROCESSING', 'COMPLETED', JSON.stringify({ result: 'Allocated from IT Inventory' }), minusHours(4)]);

  console.log('✅ Database successfully seeded!');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
