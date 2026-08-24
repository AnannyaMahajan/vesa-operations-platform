# Security Engineering & Compliance Document

## 1. Authentication & Session Security

- **Password Hashing**: Bcrypt with salt rounds = 10. Plaintext passwords are never logged or stored.
- **JWT Authentication**: Signed with HMAC-SHA256 secret. Includes 24-hour expiration token limit.
- **Environment Secrets**: Database paths, secrets, and environment keys stored strictly in `.env`. `.env` added to `.gitignore`.

---

## 2. Authorization & RBAC Safeguards

- **Backend Enforcement**: API routes use `rbacMiddleware` and `validateTransitionPermission`. Frontend button hiding is never treated as security.
- **Self-Approval Prohibition**: Requester ID check prevents employees from approving or completing their own requests.
- **Unauthorized Direct API Requests**: Direct requests without valid credentials or authorization return explicit HTTP 401 Unauthorized or HTTP 403 Forbidden.

---

## 3. Attachment & Storage Security

- **Path Traversal Safeguard**: Uploaded filenames sanitized using regex replacement (`[^a-zA-Z0-9_.-]`) and prefixed with high-entropy timestamp UUIDs.
- **MIME & Size Restrictions**: Enforces whitelist (PDF, PNG, JPG, DOC, DOCX, TXT) and 10MB file limit.
- **Protected Downloads**: Files are not publicly exposed via static folder routes. Downloads pass through `/api/requests/attachments/:id/download` with requester/assignee authorization validation.
