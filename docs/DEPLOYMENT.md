# Production Deployment & Environment Guide

## 1. Environment Configuration

### Backend Environment Variables (`.env`)
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_production_jwt_key_here
JWT_EXPIRES_IN=24h
DB_PATH=./data/vesa_workflow.db
UPLOAD_DIR=./uploads
```

---

## 2. Deployment Instructions

### Option A: Render / PM2 / Node Server Deployment
1. Clone repository to server.
2. Build frontend: `cd frontend && npm install && npm run build`.
3. Configure static serving in Express app or serve frontend dist via NGINX.
4. Start backend using PM2: `cd backend && pm2 start src/server.js --name vesa-backend`.

### Option B: Docker Containerization
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

---

## 3. Health & Monitoring Endpoints

- Health Check: `GET http://localhost:5000/health` -> Returns `{"status":"HEALTHY","service":"VESA Workflow Engine"}`.
