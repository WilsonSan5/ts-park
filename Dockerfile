# ===================================
# Multi-Stage Dockerfile for TSPark
# ===================================

# ===================================
# Development Stage
# ===================================
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY src ./src

# Expose port
EXPOSE 3000

# Development command with hot-reload
CMD ["npm", "run", "dev"]

# ===================================
# Builder Stage (for production)
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript to JavaScript
RUN npm run build

# ===================================
# Production Stage
# ===================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Production command
CMD ["npm", "start"]
