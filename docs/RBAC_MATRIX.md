# Role-Based Access Control (RBAC) Matrix

## Permissions Matrix across 6 Roles

| Capability / Action | Employee | Reporting Manager | Department Staff | Department Director | System Admin | Operations Manager |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Create Requests** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Own Requests** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Team Requests** | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **View Department Work** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Approve Stage** | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Reject Request** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Request Changes** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Start Processing** | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Complete Operation** | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Self-Approval** | 🚫 **PROHIBITED** | 🚫 **PROHIBITED** | 🚫 **PROHIBITED** | 🚫 **PROHIBITED** | 🚫 **PROHIBITED** | 🚫 **PROHIBITED** |
| **User Admin** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Configure SLA** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **View Audit Logs** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Export Reports** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### Backend Enforcement Rule
Permissions are checked independently in `backend/src/middleware/rbacMiddleware.js` and `workflowEngine.js`.
Attempting an unauthorized API action directly returns `HTTP 403 Forbidden`.
