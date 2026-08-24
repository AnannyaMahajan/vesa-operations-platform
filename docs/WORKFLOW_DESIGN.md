# Workflow State Machine & Business Process Design

## 1. Mandatory Business Processes

### A. Software Access Request
- **Approval Chain**: Employee → Reporting Manager → IT Administrator → Completed
- **Target SLA**: 24 Hours
- **Rules**: Manager validates business need; IT provisions access; rejection requires reason; self-approval prohibited.

### B. Expense Reimbursement
- **Approval Chain**: Employee → Reporting Manager → Finance Officer → Reimbursement Processing → Completed
- **Target SLA**: 48 Hours
- **Rules**: Amount & receipt verified; Finance can request additional proof; rejection requires reason.

### C. Document Approval
- **Approval Chain**: Employee → Department Manager → Department Director → Final Approval → Completed
- **Target SLA**: 72 Hours
- **Rules**: Explicit decision at each stage; changes-requested returns to previous stage; version history preserved.

### D. Equipment Request
- **Approval Chain**: Employee → Reporting Manager → IT/Admin Assessment → Procurement or Inventory → Completed
- **Target SLA**: 72 Hours
- **Rules**: Processing department checks inventory; if unavailable moves to procurement; allocation status recorded.

---

## 2. Allowed State Transition Matrix

| Current State | Allowed Next States |
| :--- | :--- |
| **SUBMITTED** | `UNDER_REVIEW`, `APPROVAL_PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |
| **UNDER_REVIEW** | `APPROVAL_PENDING`, `APPROVED`, `CHANGES_REQUESTED`, `REJECTED`, `CANCELLED` |
| **APPROVAL_PENDING** | `APPROVED`, `PROCESSING`, `CHANGES_REQUESTED`, `REJECTED`, `CANCELLED`, `COMPLETED` |
| **APPROVED** | `PROCESSING`, `COMPLETED`, `CANCELLED` |
| **PROCESSING** | `COMPLETED`, `CHANGES_REQUESTED`, `REJECTED`, `CANCELLED` |
| **CHANGES_REQUESTED** | `SUBMITTED`, `UNDER_REVIEW`, `CANCELLED` |
| **COMPLETED** | Terminal State |
| **REJECTED** | Terminal State |
| **CANCELLED** | Terminal State |
