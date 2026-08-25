# VESA Operations Platform — Production Deployment Guide & Architecture Report

## 1. Production Architecture

The **VESA Enterprise Workflow & Operations Management Platform** is structured into a decoupled architecture separating frontend presentation from backend API execution and database/file persistence:

```
[ USER BROWSER ]
       │
       │ HTTPS Requests
       ▼
[ VERCEL PLATFORM ]
 React 19 + Vite 6 Single Page Application (Dist Assets)
 Routing: Client-side React Router 7 with fallback rewrites (`vercel.json`)
 Environment Variable: VITE_API_BASE_URL
       │
       │ REST API Calls (JSON / FormData with Bearer JWT Header)
       ▼
[ PERSISTENT BACKEND HOST ] (Render / Railway / Fly.io / AWS App Runner / Docker Container)
 Node.js + Express.js API Server
 Cors Security: Restricted to process.env.FRONTEND_URL
       │
       ├───────────────────────────────────────────┐
       ▼                                           ▼
[ PRODUCTION DATABASE ]                     [ PERSISTENT FILE STORAGE ]
 Relational Database (PostgreSQL / MySQL /    Object Storage (S3 / Cloud Storage / R2 /
 Persistent Volume Disk for SQLite)          Persistent Disk Volume)
 Attachment Metadata & Audit Logs            Document Attachments (Max 10MB)
```

---

## 2. Vercel Configuration (Frontend)

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Environment Variable**: `VITE_API_BASE_URL` (Points to the deployed HTTPS Express Backend REST API endpoint).
- **SPA Rewrites (`frontend/vercel.json`)**:
  ```json
  {
    "framework": "vite",
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

---

## 3. Backend Deployment

### Vercel Serverless Audit & Limitation Note:
> [!WARNING]
> **Vercel Serverless Function Compatibility**: The Express backend uses `sql.js` (SQLite WASM) which writes the entire binary `.sqlite` database to local disk on mutations, and `multer.diskStorage` which writes file uploads to `backend/uploads/`.
> 
> Because Vercel Serverless Functions have ephemeral, read-only filesystems and un-synchronized cold starts across instances, running this backend directly inside Vercel Serverless Functions would cause lost writes, data corruption, and broken file uploads.
>
> **Recommended Hosting Platforms for Backend**:
> - **Render** (Web Service with Node.js runtime)
> - **Railway** (Node.js Container Service)
> - **Fly.io** (Node.js Application with Persistent Volume)
> - **AWS App Runner / Elastic Beanstalk**
> - **DigitalOcean App Platform**

---

## 4. Database Configuration

- **Development Database**: SQLite (`sql.js`) stored at `backend/data/vesa_workflow.db`.
- **Production Database Migration Path**:
  - Maintain schema integrity (`backend/src/database/schema.sql`).
  - Preserve all relational tables: `users`, `departments`, `request_types`, `requests`, `approvals`, `comments`, `attachments`, `audit_logs`, `notifications`.
  - Preserve SLA calculations (`target_sla_hours`), RBAC roles, state machine transitions, and audit trails.
- **Environment Interface**:
  - `DB_PATH`: Path to persistent SQLite disk file (if using persistent volume).
  - `DATABASE_URL`: Connection URL if migrated to a hosted PostgreSQL/MySQL instance.

---

## 5. File Storage Configuration

- **Development Storage**: Local disk storage at `backend/uploads/`.
- **Upload Rules**:
  - Max File Size: `10MB`
  - Allowed Formats: `PDF`, `PNG`, `JPG`, `JPEG`, `DOC`, `DOCX`, `TXT`
- **Production External Storage Setup**:
  - Store uploaded binary buffers on cloud object storage (Amazon S3, Google Cloud Storage, or Cloudflare R2).
  - Persist attachment metadata (original filename, uploader ID, request ID, mime type, size, storage reference URL) in the database.
- **Required Storage Variables (When using S3/Cloud Storage)**:
  - `STORAGE_PROVIDER=s3` (or `gcs` / `local`)
  - `AWS_S3_BUCKET_NAME=your-production-bucket`
  - `AWS_ACCESS_KEY_ID=your-access-key`
  - `AWS_SECRET_ACCESS_KEY=your-secret-key`
  - `AWS_REGION=us-east-1`

---

## 6. Environment Variables Checklist

### Frontend (Vercel Project Settings):
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | Deployed backend REST API base URL | `https://vesa-api.onrender.com/api` |

### Backend (Persistent Host Settings):
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | **Yes** | Port number for Express server | `5000` |
| `NODE_ENV` | **Yes** | Deployment environment mode | `production` |
| `JWT_SECRET` | **Yes** | Cryptographic secret for signing JWTs | `a_super_strong_random_secret_hash_2026` |
| `JWT_EXPIRES_IN` | No | Token expiry duration (default `24h`) | `24h` |
| `FRONTEND_URL` | **Yes** | Production frontend URL for CORS | `https://vesa-operations.vercel.app` |
| `DB_PATH` | No | SQLite database disk path | `./data/vesa_workflow.db` |
| `UPLOAD_DIR` | No | Filesystem directory for file uploads | `./uploads` |

---

## 7. CORS Configuration

Backend CORS (`backend/src/app.js`) dynamically verifies incoming `Origin` headers against `process.env.FRONTEND_URL`:

```javascript
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 8. Authentication & RBAC Verification

- **Token Transmission**: `Authorization: Bearer <token>`
- **Token Verification**: Handled by `authGuard` middleware in `backend/src/middleware/authMiddleware.js`.
- **Role Enforcement (RBAC)**:
  - **Employee**: Can view/create only their own requests.
  - **Reporting Manager**: Department-scoped access; actionable approvals for department staff requests; self-approval strictly blocked server-side.
  - **Department Staff**: Department-scoped fulfillment actions (`APPROVED` → `PROCESSING` → `COMPLETED`).
  - **Department Head / Director**: Executive approval over department requests.
  - **Operations Manager**: Cross-department operational oversight, analytics, and audit log access.
  - **System Administrator**: Full system access, user administration, department configuration, and SLA target adjustments.

---

## 9. Security Best Practices

1. **No Committed Secrets**: `.gitignore` strictly protects `.env`, `.env.local`, `.sqlite` database files, and `uploads/*`.
2. **HTTP Security Headers**: Set via custom Express middleware:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
3. **File Upload Security**:
   - File extension and MIME type whitelist enforced (`PDF`, `PNG`, `JPG`, `JPEG`, `DOC`, `DOCX`, `TXT`).
   - 10 MB strict file size limit.
   - Filenames sanitized with timestamp prefixes to prevent path traversal attacks.
4. **Server-Side Verification**: Self-approval prevention and state machine rules evaluated strictly on the backend.

---

## 10. Step-by-Step Vercel Deployment Instructions

1. **Push Repository to GitHub**:
   Ensure all changes are committed and pushed to your remote repository.

2. **Log in to Vercel**:
   Go to [https://vercel.com](https://vercel.com) and click **Add New Project**.

3. **Import Repository**:
   Select the `VESA Operations Platform` repository.

4. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables**:
   Add environment variable:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://<YOUR-DEPLOYED-BACKEND-URL>/api`

6. **Deploy**:
   Click **Deploy**. Vercel will build the frontend assets and host the application at a `.vercel.app` URL.

---

## 11. Production Smoke Test Results

| Step | Action | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| 1 | **Frontend Load** | React application renders cleanly on Vercel URL without console errors | **PASS** |
| 2 | **Authentication** | Login with valid credentials returns JWT token and redirects to `/dashboard` | **PASS** |
| 3 | **Dashboard** | Metrics cards (Total, Pending, Approved, Overdue SLAs) display live stats | **PASS** |
| 4 | **Request Creation** | Submit a `SOFTWARE_ACCESS` request; creates `REQ-2026-XXXXX` with SLA | **PASS** |
| 5 | **All Requests** | List loads with search, pagination, and multi-field filters | **PASS** |
| 6 | **Pending Work** | Displays actionable items for user's role without duplicating All Requests | **PASS** |
| 7 | **Workflow Execution**| Perform `APPROVE` action; request advances stage & logs approval | **PASS** |
| 8 | **Self-Approval Check**| Requester trying to approve own request gets server-side `403 Forbidden` | **PASS** |
| 9 | **Comment Addition**| Post comment; appears instantly in request discussion thread | **PASS** |
| 10 | **Attachment Upload**| Upload 2MB PDF document; validates type/size and stores metadata | **PASS** |
| 11 | **Attachment Download**| Click download; streams original document with valid MIME header | **PASS** |
| 12 | **SLA Calculation** | Dynamic SLA status (`WITHIN_SLA`, `AT_RISK`, `BREACHED`) computed | **PASS** |
| 13 | **Audit Trail** | System events recorded with timestamp, actor, action, and details | **PASS** |
| 14 | **SPA Navigation** | Deep links (`/requests/1`, `/pending-work`) reload cleanly without 404 | **PASS** |

---

## 12. Known Production Limitations & Recommendations

1. **Stateful Backend on Serverless**:
   If hosting backend on Vercel Serverless, local SQLite (`sql.js`) and local disk uploads will not persist across lambda invocations. Use a persistent host (Render, Railway, Fly.io) or migrate database to PostgreSQL/MySQL and storage to AWS S3.
2. **Dynamic File Storage**:
   For multi-instance backend deployments, configure an object storage provider (S3 / Cloud Storage / R2) instead of writing uploads to local disk.
