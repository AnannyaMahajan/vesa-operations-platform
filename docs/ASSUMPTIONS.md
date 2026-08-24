# Architectural Assumptions & Design Trade-offs

## 1. Domain Assumptions

1. **Department Reporting Hierarchy**:
   - Each employee belongs to a specific department.
   - Initial approval stage routes to the manager assigned to the employee's department.

2. **Self-Approval Guard Policy**:
   - Employees (including managers submitting their own requests) cannot approve their own submissions.
   - If a Reporting Manager submits a request, approval is routed to their Department Director or another authorized manager.

3. **Mandatory Action Comments**:
   - Approvals allow optional comments.
   - Rejections and Requests for Changes unconditionally require non-empty text justification comments to ensure decision auditability.

---

## 2. Technical Trade-offs

1. **Relational Database Engine Choice**:
   - **Choice**: SQLite via `sql.js` (pure WebAssembly / JS).
   - **Rationale**: Eliminates OS-specific binary compilation dependencies (such as node-gyp / MSVC on Windows), providing zero-config portability while preserving relational foreign keys, indexes, and full SQL transaction capabilities.
   - **Production Migration Path**: Easily migrates to PostgreSQL using Knex / Prisma for multi-region clustering.

2. **Client-Side SPA vs Server-Side Rendering**:
   - **Choice**: React SPA (Vite) with REST API.
   - **Rationale**: High interactive responsiveness for complex dashboard charts, interactive timeline steppers, and multi-filter request grids.
