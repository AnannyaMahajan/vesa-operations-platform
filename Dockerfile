# Multi-stage production build for VESA Operations Platform

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Backend Server
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy Backend Dependencies & Code
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production
COPY backend/ ./

# Copy compiled frontend dist into backend serving path
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose backend port
EXPOSE 5000

# Seed database and start production server
CMD ["sh", "-c", "node src/database/seed.js && node src/server.js"]
