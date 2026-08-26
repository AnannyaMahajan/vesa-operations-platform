export const MOCK_USERS = [
  { id: 1, email: 'aarav.sharma@company.com', full_name: 'Aarav Sharma', role: 'Employee', department_id: 1, department_name: 'Product Engineering', department_code: 'ENG' },
  { id: 2, email: 'priya.mehta@company.com', full_name: 'Priya Mehta', role: 'Reporting Manager', department_id: 1, department_name: 'Product Engineering', department_code: 'ENG' },
  { id: 3, email: 'vikram.singh@company.com', full_name: 'Vikram Singh', role: 'Department Staff', department_id: 5, department_name: 'IT & Infrastructure', department_code: 'IT' },
  { id: 4, email: 'elena.rodriguez@company.com', full_name: 'Elena Rodriguez', role: 'Department Head / Director', department_id: 1, department_name: 'Product Engineering', department_code: 'ENG' },
  { id: 5, email: 'alex.chen@company.com', full_name: 'Alex Chen', role: 'System Administrator', department_id: 5, department_name: 'IT & Infrastructure', department_code: 'IT' },
  { id: 6, email: 'sarah.jenkins@company.com', full_name: 'Sarah Jenkins', role: 'Operations Manager', department_id: 3, department_name: 'Operations & Logistics', department_code: 'OPS' },
  { id: 7, email: 'finance.officer@company.com', full_name: 'Rohan Patel (Finance)', role: 'Department Staff', department_id: 4, department_name: 'Finance & Accounting', department_code: 'FIN' },
  { id: 8, email: 'neha.verma@company.com', full_name: 'Neha Verma', role: 'Employee', department_id: 3, department_name: 'Operations & Logistics', department_code: 'OPS' }
];

export const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Product Engineering', code: 'ENG', manager_name: 'Priya Mehta' },
  { id: 2, name: 'Marketing & Growth', code: 'MKT', manager_name: 'Priya Mehta' },
  { id: 3, name: 'Operations & Logistics', code: 'OPS', manager_name: 'Sarah Jenkins' },
  { id: 4, name: 'Finance & Accounting', code: 'FIN', manager_name: 'Rohan Patel' },
  { id: 5, name: 'IT & Infrastructure', code: 'IT', manager_name: 'Alex Chen' },
  { id: 6, name: 'Human Resources', code: 'HR', manager_name: 'Elena Rodriguez' }
];

export const MOCK_SLA_CONFIGS = [
  { id: 1, name: 'Software Access Request', code: 'SOFTWARE_ACCESS', target_sla_hours: 24 },
  { id: 2, name: 'Expense Reimbursement', code: 'EXPENSE_REIMBURSEMENT', target_sla_hours: 48 },
  { id: 3, name: 'Document Approval', code: 'DOCUMENT_APPROVAL', target_sla_hours: 72 },
  { id: 4, name: 'Equipment Request', code: 'EQUIPMENT_REQUEST', target_sla_hours: 72 }
];

export const MOCK_REQUESTS = [
  {
    id: 1,
    request_number: 'REQ-2026-00001',
    request_type_id: 1,
    request_type_name: 'Software Access Request',
    request_type_code: 'SOFTWARE_ACCESS',
    title: 'Access to Jira & Confluence License',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    requester_id: 1,
    requester_name: 'Aarav Sharma',
    requester_email: 'aarav.sharma@company.com',
    department_id: 1,
    department_name: 'Product Engineering',
    current_assignee_id: 2,
    current_assignee_name: 'Priya Mehta',
    current_stage_order: 1,
    current_stage_name: 'Reporting Manager Review',
    sla_due_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    sla_status: 'WITHIN_SLA',
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    payload: {
      software_name: 'Project Management Suite (Jira & Confluence)',
      access_level: 'Standard User',
      business_justification: 'Required for sprint planning and cross-team project coordination on Q3 initiatives.',
      required_date: '2026-08-25',
      additional_comments: 'Urgent onboarding requirement for new project module.'
    },
    workflow_stages: [
      { stage: 1, name: 'Reporting Manager Review', role: 'Reporting Manager', status: 'IN_PROGRESS', assignee_id: 2, assignee_name: 'Priya Mehta' },
      { stage: 2, name: 'IT Administrator Provisioning', role: 'Department Staff', status: 'PENDING', assignee_id: 3, assignee_name: 'Vikram Singh' }
    ],
    approvals: [],
    comments: [
      { id: 1, author_name: 'Aarav Sharma', author_role: 'Employee', message: 'Please grant admin permissions if possible.', created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() }
    ],
    attachments: []
  },
  {
    id: 2,
    request_number: 'REQ-2026-00002',
    request_type_id: 2,
    request_type_name: 'Expense Reimbursement',
    request_type_code: 'EXPENSE_REIMBURSEMENT',
    title: 'Client Meeting Expense - Bangalore Summit',
    priority: 'MEDIUM',
    status: 'APPROVAL_PENDING',
    requester_id: 2,
    requester_name: 'Priya Mehta',
    requester_email: 'priya.mehta@company.com',
    department_id: 2,
    department_name: 'Marketing & Growth',
    current_assignee_id: 7,
    current_assignee_name: 'Rohan Patel (Finance)',
    current_stage_order: 2,
    current_stage_name: 'Finance Verification',
    sla_due_at: new Date(Date.now() + 30 * 3600 * 1000).toISOString(),
    sla_status: 'WITHIN_SLA',
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    payload: {
      expense_category: 'Client Meeting & Travel',
      expense_date: '2026-08-18',
      amount: 4850,
      description: 'Dinner meeting with Enterprise partner representatives and taxi fare.',
      business_purpose: 'Closing Annual Enterprise SLA Renewal Contract.',
      receipt_attached: true
    },
    workflow_stages: [
      { stage: 1, name: 'Manager Justification Review', role: 'Reporting Manager', status: 'APPROVED', assignee_id: 4, assignee_name: 'Elena Rodriguez' },
      { stage: 2, name: 'Finance Verification', role: 'Department Staff', status: 'IN_PROGRESS', assignee_id: 7, assignee_name: 'Rohan Patel (Finance)' },
      { stage: 3, name: 'Reimbursement Processing', role: 'Department Staff', status: 'PENDING', assignee_id: 7, assignee_name: 'Rohan Patel (Finance)' }
    ],
    approvals: [
      { id: 1, stage_name: 'Manager Justification Review', approver_name: 'Elena Rodriguez', action: 'APPROVED', comment: 'Expense verified against Q3 marketing client budget.', created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() }
    ],
    comments: [
      { id: 2, author_name: 'Rohan Patel (Finance)', author_role: 'Department Staff', message: 'Please upload the itemized food invoice alongside the total receipt.', created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString() }
    ],
    attachments: []
  },
  {
    id: 3,
    request_number: 'REQ-2026-00003',
    request_type_id: 3,
    request_type_name: 'Document Approval',
    request_type_code: 'DOCUMENT_APPROVAL',
    title: 'Customer Data Handling Procedure v1.2',
    priority: 'URGENT',
    status: 'APPROVAL_PENDING',
    requester_id: 8,
    requester_name: 'Neha Verma',
    requester_email: 'neha.verma@company.com',
    department_id: 3,
    department_name: 'Operations & Logistics',
    current_assignee_id: 4,
    current_assignee_name: 'Elena Rodriguez',
    current_stage_order: 2,
    current_stage_name: 'Department Director Final Sign-off',
    sla_due_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    sla_status: 'OVERDUE',
    created_at: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    payload: {
      document_title: 'Customer Data Handling & Compliance Standard',
      document_type: 'Internal Policy Standard',
      version: '1.2',
      approval_deadline: '2026-08-26',
      description: 'Updated guidelines aligning with GDPR and SOC2 compliance standards.'
    },
    workflow_stages: [
      { stage: 1, name: 'Department Manager Review', role: 'Reporting Manager', status: 'APPROVED', assignee_id: 2, assignee_name: 'Priya Mehta' },
      { stage: 2, name: 'Department Director Final Sign-off', role: 'Department Head / Director', status: 'IN_PROGRESS', assignee_id: 4, assignee_name: 'Elena Rodriguez' }
    ],
    approvals: [
      { id: 2, stage_name: 'Department Manager Review', approver_name: 'Priya Mehta', action: 'APPROVED', comment: 'Policy structure looks solid. Forwarding for Director sign-off.', created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString() }
    ],
    comments: [],
    attachments: []
  },
  {
    id: 4,
    request_number: 'REQ-2026-00004',
    request_type_id: 4,
    request_type_name: 'Equipment Request',
    request_type_code: 'EQUIPMENT_REQUEST',
    title: 'Dual 4K External Monitor for Development',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    requester_id: 1,
    requester_name: 'Aarav Sharma',
    requester_email: 'aarav.sharma@company.com',
    department_id: 1,
    department_name: 'Product Engineering',
    current_assignee_id: 3,
    current_assignee_name: 'Vikram Singh',
    current_stage_order: 3,
    current_stage_name: 'Procurement or Inventory Allocation',
    sla_due_at: new Date(Date.now() + 40 * 3600 * 1000).toISOString(),
    sla_status: 'COMPLETED_WITHIN_SLA',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    payload: {
      equipment_type: 'External Monitor (27-inch 4K)',
      quantity: 1,
      business_justification: 'Required for split-screen frontend layout debugging and micro-frontend testing.',
      required_date: '2026-08-20',
      allocation_status: 'Allocated from IT Inventory - Tag #DEV-MON-891'
    },
    workflow_stages: [
      { stage: 1, name: 'Reporting Manager Approval', role: 'Reporting Manager', status: 'APPROVED', assignee_id: 2, assignee_name: 'Priya Mehta' },
      { stage: 2, name: 'IT/Admin Availability Check', role: 'Department Staff', status: 'APPROVED', assignee_id: 3, assignee_name: 'Vikram Singh' },
      { stage: 3, name: 'Procurement or Inventory Allocation', role: 'Department Staff', status: 'APPROVED', assignee_id: 3, assignee_name: 'Vikram Singh' }
    ],
    approvals: [
      { id: 3, stage_name: 'Reporting Manager Approval', approver_name: 'Priya Mehta', action: 'APPROVED', comment: 'Approved for engineering team setup.', created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString() },
      { id: 4, stage_name: 'IT/Admin Availability Check', approver_name: 'Vikram Singh', action: 'APPROVED', comment: 'Item available in IT Storage Bay B.', created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString() },
      { id: 5, stage_name: 'Procurement or Inventory Allocation', approver_name: 'Vikram Singh', action: 'APPROVED', comment: 'Issued monitor Tag #DEV-MON-891 to Aarav Sharma.', created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString() }
    ],
    comments: [],
    attachments: []
  }
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Approval Required', message: 'Aarav Sharma submitted a Software Access Request: Access to Jira & Confluence License', type: 'APPROVAL_REQUIRED', is_read: 0, created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
  { id: 2, title: 'Action Required', message: 'Priya Mehta submitted Expense Reimbursement REQ-2026-00002 for verification', type: 'APPROVAL_REQUIRED', is_read: 0, created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: 3, title: 'Final Approval Needed', message: 'Document Approval REQ-2026-00003 is awaiting your final sign-off (OVERDUE)', type: 'SLA_WARNING', is_read: 0, created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString() }
];

export const MOCK_AUDIT_LOGS = [
  { id: 1, request_id: 1, request_number: 'REQ-2026-00001', actor_name: 'Aarav Sharma', action: 'REQUEST_SUBMITTED', previous_state: null, new_state: 'UNDER_REVIEW', details: { priority: 'HIGH', type: 'SOFTWARE_ACCESS' }, timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
  { id: 2, request_id: 2, request_number: 'REQ-2026-00002', actor_name: 'Priya Mehta', action: 'REQUEST_SUBMITTED', previous_state: null, new_state: 'SUBMITTED', details: { amount: 4850 }, timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString() },
  { id: 3, request_id: 2, request_number: 'REQ-2026-00002', actor_name: 'Elena Rodriguez', action: 'APPROVAL_GRANTED', previous_state: 'SUBMITTED', new_state: 'APPROVAL_PENDING', details: { stage: 1, comment: 'Expense verified' }, timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: 4, request_id: 4, request_number: 'REQ-2026-00004', actor_name: 'Aarav Sharma', action: 'REQUEST_SUBMITTED', previous_state: null, new_state: 'SUBMITTED', details: { item: 'External Monitor' }, timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
  { id: 5, request_id: 4, request_number: 'REQ-2026-00004', actor_name: 'Vikram Singh', action: 'REQUEST_COMPLETED', previous_state: 'PROCESSING', new_state: 'COMPLETED', details: { result: 'Allocated from IT Inventory' }, timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString() }
];
