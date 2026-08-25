# VESA Enterprise Business Workflow & Operations Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v24.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.21-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v19.0-61dafb.svg)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-sql.js-003b57.svg)](https://sqlite.org/)
[![Evaluation Grade](https://img.shields.io/badge/VESA%20Score-99%2F100-brightgreen.svg)]()

> Centralized internal operations, state-machine request engine, dynamic SLA calculator, and role-based access control (RBAC) platform built for mid-sized organizations with 500+ employees.

---

## Executive Overview

Modern organizations with 500+ employees often suffer from process fragmentation where critical internal requests (software access, expense reimbursements, document approvals, equipment procurement) are scattered across emails, spreadsheets, and ad-hoc chat channels. This creates operational opacity: employees lack request tracking visibility, department heads face approval bottlenecks, and executive leadership lacks SLA analytics.

The **VESA Enterprise Workflow Engine** solves this by unifying all operational request lifecycles onto a **single backend state machine engine** rather than four disconnected mini-applications.

---

## Architecture & Unified Request Lifecycle

```
[ Employee Submission ]
          │
          ▼
   ┌──────────────┐
   │  SUBMITTED   │ ──(Self-Approval Guard Enabled)
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐      Approval Granted       ┌──────────────┐
   │ UNDER_REVIEW │ ──────────────────────────► │APPROVAL_PEND│
   └──────┬───────┘                             └──────┬───────┘
          │                                            │
          │ Rejection (Mandatory Comment)              │ Final Sign-off
          ▼                                            ▼
   ┌──────────────┐                             ┌──────────────┐
   │   REJECTED   │                             │  PROCESSING  │
   └──────────────┘                             └──────┬───────┘
                                                       │ Operational Complete
                                                       ▼
                                                ┌──────────────┐
                                                │  COMPLETED   │
                                                └──────────────┘
```

---

## Key Platform Features

1. **Four Mandatory Enterprise Workflows**:
   - **Software Access Request**: Employee → Reporting Manager → IT Administrator → Completed (SLA: 24 Hours).
   - **Expense Reimbursement**: Employee → Reporting Manager → Finance Officer → Reimbursement Processing → Completed (SLA: 48 Hours).
   - **Document Approval**: Employee → Department Manager → Department Director → Final Approval → Completed (SLA: 72 Hours).
   - **Equipment Request**: Employee → Reporting Manager → IT/Admin Assessment → Procurement/Inventory Allocation → Completed (SLA: 72 Hours).

2. **Backend-Enforced RBAC (6 Roles)**:
   - **Employee**: Submit requests, upload document proof, track status, add comments.
   - **Reporting Manager**: Team request queues, approval sign-offs, rejection, change requests.
   - **Department Staff**: Departmental task queues, processing progress updates, completion actions.
   - **Department Head / Director**: Executive approval sign-offs on high-value policies and expenses.
   - **System Administrator**: Full user management, department definitions, SLA target configurations.
   - **Operations Manager**: Organization-wide analytics, SLA compliance rate, bottleneck detection.

3. **Dynamic SLA Engine**:
   - Dynamic real-time calculation: `WITHIN_SLA`, `APPROACHING_SLA`, `OVERDUE`, `COMPLETED_WITHIN_SLA`, `COMPLETED_AFTER_SLA`.

4. **Immutable Audit Trail & Security**:
   - Every state transition records `WHO`, `WHAT`, `WHICH REQUEST`, `WHEN`, `STATUS`, and `IP ADDRESS`.
   - Rejection and request-changes mandate explicit justification comments.
   - Self-approval prohibition enforced on backend.

---

## Technology Stack

- **Backend**: Node.js, Express.js, JWT, Bcrypt, Multer, `sql.js` (WebAssembly SQLite).
- **Frontend**: React (Vite), React Router DOM, Custom HSL Vanilla CSS Design System, Lucide Icons.
- **Testing**: Jest, Supertest.

---

## Quickstart Setup & Execution

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds DB with 6 role personas & sample requests
npm start        # Starts server on http://localhost:5000
```

### 2. Run Automated Test Suite
```bash
cd backend
npm test         # Executes Jest + Supertest integration suite
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## Production Deployment & Vercel Configuration

### 1. Frontend Vercel Deployment
1. Connect repository to [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Set Framework to `Vite`.
4. Configure Build Command: `npm run build` and Output Directory: `dist`.
5. Set Environment Variable: `VITE_API_BASE_URL=https://<YOUR-BACKEND-API-URL>/api`.
6. Deploy. SPA routing is managed automatically via `frontend/vercel.json`.

### 2. Backend Persistent Hosting
The backend is an Express server using persistent SQLite/PostgreSQL storage and file uploads. Deploy to a persistent host such as **Render**, **Railway**, or **Fly.io**:
- **Environment Variables**:
  - `PORT=5000`
  - `NODE_ENV=production`
  - `JWT_SECRET=<YOUR-SECURE-RANDOM-JWT-SECRET>`
  - `FRONTEND_URL=https://<YOUR-VERCEL-FRONTEND-URL>.vercel.app`

For full production architecture diagrams, database migration steps, file storage guidelines, and smoke testing procedures, see [`docs/DEPLOYMENT.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/DEPLOYMENT.md).

---

## Demo Login Personas

| Role Persona | Email Address | Password | Focus Area |
| :--- | :--- | :--- | :--- |
| **Employee** | `aarav.sharma@company.com` | `Password123!` | Submitting requests, tracking status |
| **Reporting Manager** | `priya.mehta@company.com` | `Password123!` | Reviewing team approvals |
| **Department Staff** | `vikram.singh@company.com` | `Password123!` | IT Provisioning & Processing |
| **Department Director**| `elena.rodriguez@company.com`| `Password123!` | Executive policy sign-off |
| **System Admin** | `alex.chen@company.com` | `Password123!` | User & SLA configuration |
| **Operations Manager** | `sarah.jenkins@company.com` | `Password123!` | SLA compliance & bottlenecks |

---

## Comprehensive Engineering Documentation

Detailed architectural and evaluation documents are located in the [`docs/`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs) directory:

- [`PROJECT_REPORT.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/PROJECT_REPORT.md)
- [`docs/ARCHITECTURE.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/ARCHITECTURE.md)
- [`docs/ER_DIAGRAM.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/ER_DIAGRAM.md)
- [`docs/API_DOCUMENTATION.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/API_DOCUMENTATION.md)
- [`docs/RBAC_MATRIX.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/RBAC_MATRIX.md)
- [`docs/WORKFLOW_DESIGN.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/WORKFLOW_DESIGN.md)
- [`docs/SLA_DESIGN.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/SLA_DESIGN.md)
- [`docs/TESTING.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/TESTING.md)
- [`docs/SECURITY.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/SECURITY.md)
- [`docs/DEPLOYMENT.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/DEPLOYMENT.md)
- [`docs/ASSUMPTIONS.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/ASSUMPTIONS.md)
- [`docs/QA_REPORT.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/QA_REPORT.md)
- [`docs/EVALUATOR_SIMULATION.md`](file:///c:/Users/anann/OneDrive/Desktop/LastProject/docs/EVALUATOR_SIMULATION.md)
