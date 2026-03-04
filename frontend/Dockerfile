# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy build artifacts
COPY --from=builder /app/.next .next/static .next/images

# Copy next config
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1000 -S nodejs && \
    adduser -u 1000 -G nodejs nodejs

WORKDIR /app

# Set correct permissions for pre-compiled scripts
RUN chown -R nodejs:nodejs /app/.next
RUN chmod -R +x /app/.next

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "node_modules/.bin/next", "start", "-H", "0.0.0.0"]
