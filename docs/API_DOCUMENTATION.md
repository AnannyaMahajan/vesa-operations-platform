# REST API Documentation & Endpoint Reference

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user account.
- **Request Body**:
```json
{
  "email": "employee@company.com",
  "password": "Password123!",
  "full_name": "New Employee",
  "department_id": 1,
  "role": "Employee"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Account successfully registered.",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": { "id": 9, "email": "employee@company.com", "role": "Employee" }
}
```

### `POST /auth/login`
Authenticates a user and returns a JWT bearer token.
- **Request Body**:
```json
{
  "email": "aarav.sharma@company.com",
  "password": "Password123!"
}
```

---

## 2. Request Engine Endpoints

### `POST /requests`
Submits a new business request.
- **Request Body**:
```json
{
  "request_type_code": "SOFTWARE_ACCESS",
  "title": "Jira License Request",
  "priority": "HIGH",
  "payload": {
    "software_name": "Jira Enterprise",
    "access_level": "Standard User",
    "business_justification": "Required for sprint planning",
    "required_date": "2026-08-25"
  }
}
```

### `GET /requests`
Lists requests with filtering, search, and pagination.
- **Query Params**: `search`, `request_type_id`, `department_id`, `status`, `priority`, `sla_status`, `page`, `limit`

### `POST /requests/:id/action`
Executes a state transition action (`APPROVE`, `REJECT`, `REQUEST_CHANGES`, `START_PROCESSING`, `COMPLETE`, `CANCEL`).
- **Request Body**:
```json
{
  "action": "APPROVE",
  "comment": "Justification verified against Q3 budget."
}
```
