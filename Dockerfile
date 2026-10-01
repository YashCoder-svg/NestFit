# Multi-stage Dockerfile for NestFit Full-Stack Deployment on Render
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies for both frontend and backend
RUN npm --prefix frontend install
RUN npm --prefix backend install

# Copy application sources
COPY frontend ./frontend
COPY backend ./backend

# Build frontend (Vite) and backend (TypeScript)
RUN npm --prefix frontend run build
RUN npm --prefix backend run build

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

# Install production dependencies for backend
COPY backend/package*.json ./backend/
RUN npm --prefix backend install --omit=dev

# Copy compiled backend
COPY --from=builder /app/backend/dist ./backend/dist

# Copy compiled frontend assets for Express static serving
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 10000

CMD ["node", "backend/dist/index.js"]
