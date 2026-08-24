# Automated Testing & Verification Plan

## 1. Test Architecture & Frameworks

- **Backend Integration Tests**: Built with Jest and Supertest.
- **Isolated Test Database**: Uses in-memory SQLite database (`:memory:`) to ensure fast, deterministic, non-destructive test execution.

---

## 2. Automated Test Execution Results

```
PASS tests/auth.test.js
  ✓ should log in successfully with valid credentials
  ✓ should reject login with invalid password
  ✓ should register a new employee account
  ✓ should reject registration with duplicate email

PASS tests/rbac.test.js
  ✓ should PREVENT an Employee from approving their own request (Self-Approval Prohibition)
  ✓ should REJECT an Employee trying to access Admin endpoints with 403 Forbidden
  ✓ should REJECT unauthenticated direct API access with 401 Unauthorized

PASS tests/workflows.test.js
  ✓ should create a valid Software Access Request
  ✓ should require a justification comment when rejecting a request
  ✓ should allow Manager to approve a pending team request

PASS tests/sla.test.js
  ✓ should correctly compute target SLA due timestamp based on hours
  ✓ should mark an active request as OVERDUE if current time > due time
  ✓ should mark completed requests within window as COMPLETED_WITHIN_SLA

Test Suites: 4 passed, 4 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        3.693 s
```

---

## 3. Frontend Build Verification

```
vite v6.4.3 building for production...
✓ 1623 modules transformed.
dist/index.html                   0.46 kB
dist/assets/index-DceWDpQu.css    7.86 kB
dist/assets/index-VTm1wrPG.js   327.55 kB
✓ built in 3.33s
```
