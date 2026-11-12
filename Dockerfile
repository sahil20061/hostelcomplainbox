# Multi-stage Docker build for SBS Hostel Portal
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and client package definitions
COPY package*.json ./
COPY client/package*.json ./client/

# Install root & client dependencies
RUN npm install
RUN npm --prefix client install

# Copy source code
COPY . .

# Build React client bundle
RUN npm --prefix client run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules & server files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/index.js"]
