# System Architecture Specification

## 1. High-Level System Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Client Layer (React 19 + Vite)             │
│   ┌──────────────┐   ┌───────────────┐  ┌────────────┐  │
│   │ Dashboards   │   │ Request Forms │  │ Admin / QA │  │
│   └──────┬───────┘   └───────┬───────┘  └─────┬──────┘  │
└──────────┼───────────────────┼────────────────┼─────────┘
           │ HTTP / REST APIs  │ (JWT Bearer)   │
┌──────────▼───────────────────▼────────────────▼─────────┐
│           Backend API Layer (Node.js Express)           │
│   ┌──────────────┐   ┌───────────────┐  ┌────────────┐  │
│   │ Auth Guard   │   │ RBAC Guard     │  │ Validator  │  │
│   └──────┬───────┘   └───────┬───────┘  └─────┬──────┘  │
│          │                   │                │         │
│   ┌──────▼───────────────────▼────────────────▼──────┐  │
│   │           Unified State Machine Engine           │  │
│   └──────────────────────────┬───────────────────────┘  │
└──────────────────────────────┼──────────────────────────┘
                               │ Database Queries & Transactions
┌──────────────────────────────▼──────────────────────────┐
│      Relational Database Layer (SQLite / PostgreSQL)     │
│   [users]  [departments]  [request_types]  [requests]   │
│   [approvals]  [comments]  [attachments]   [audit_logs] │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Component Design & Responsibilities

1. **Frontend Single Page Application (SPA)**:
   - Built with React 19 and Vite for fast load speeds.
   - Encapsulates UI logic, role-driven component rendering, form validation, and toast feedback.

2. **Backend Controller & Middleware Layer**:
   - `authMiddleware`: Validates JWT tokens and checks account status.
   - `rbacMiddleware`: Enforces permission matrices independently of UI button visibility.
   - `fileUpload`: Enforces file type validation, 10MB limits, UUID filenames, and path traversal prevention.

3. **Core Services Engine**:
   - `workflowEngine`: Manages allowed transition matrix, stage advancement, and self-approval guards.
   - `slaCalculator`: Dynamic timestamp calculation engine for SLA compliance status.
   - `auditService`: Writes immutable records for every business event.
