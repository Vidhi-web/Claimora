# ═════════════════════════════════════════════════════════════
# Claimora Frontend — Production Multi-Stage Dockerfile
# ═════════════════════════════════════════════════════════════

# ── Stage 1: Build Angular SPA ──
FROM node:20-alpine AS builder
WORKDIR /app

# Cache dependency install
COPY package*.json ./
RUN npm ci

# Copy project files and compile production bundle
COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: Serve with Nginx ──
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default nginx website
RUN rm -rf ./*

# Copy built artifacts from Angular build
COPY --from=builder /app/dist/frontend/browser .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
