-- VESA Project 3 Enterprise Workflow Platform Schema (SQLite)

CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    manager_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Employee', 'Reporting Manager', 'Department Staff', 'Department Head / Director', 'System Administrator', 'Operations Manager')),
    department_id INTEGER REFERENCES departments(id),
    status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Foreign key link for manager in departments
-- (Handled in application logic / alter table)

CREATE TABLE IF NOT EXISTS request_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL CHECK(code IN ('SOFTWARE_ACCESS', 'EXPENSE_REIMBURSEMENT', 'DOCUMENT_APPROVAL', 'EQUIPMENT_REQUEST')),
    name TEXT NOT NULL,
    description TEXT,
    target_sla_hours INTEGER NOT NULL,
    default_stages_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_number TEXT UNIQUE NOT NULL,
    request_type_id INTEGER NOT NULL REFERENCES request_types(id),
    requester_id INTEGER NOT NULL REFERENCES users(id),
    department_id INTEGER NOT NULL REFERENCES departments(id),
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'MEDIUM' CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status TEXT DEFAULT 'SUBMITTED' CHECK(status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVAL_PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CHANGES_REQUESTED', 'CANCELLED', 'OVERDUE')),
    current_assignee_id INTEGER REFERENCES users(id),
    current_stage_order INTEGER DEFAULT 1,
    payload_json TEXT NOT NULL,
    sla_due_at DATETIME NOT NULL,
    sla_status TEXT DEFAULT 'WITHIN_SLA' CHECK(sla_status IN ('WITHIN_SLA', 'APPROACHING_SLA', 'OVERDUE', 'COMPLETED_WITHIN_SLA', 'COMPLETED_AFTER_SLA')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

CREATE TABLE IF NOT EXISTS approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    stage_order INTEGER NOT NULL,
    stage_name TEXT NOT NULL,
    approver_id INTEGER NOT NULL REFERENCES users(id),
    action TEXT NOT NULL CHECK(action IN ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    uploader_id INTEGER NOT NULL REFERENCES users(id),
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id INTEGER REFERENCES requests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER REFERENCES requests(id) ON DELETE SET NULL,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    details_json TEXT,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_requests_requester ON requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_department ON requests(department_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_assignee ON requests(current_assignee_id);
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(request_type_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_request ON audit_logs(request_id);
