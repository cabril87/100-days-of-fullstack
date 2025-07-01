# ================================
# ENTERPRISE DEVELOPMENT DOCKERFILE
# TaskTracker Frontend - Development Environment
# Optimized for service worker cache management
# ================================

# Use Node.js 18 Alpine for development performance
FROM node:18-alpine AS development

# Set development environment variables
ENV NODE_ENV=development
ENV DOCKER_ENVIRONMENT=true
ENV BUILD_ID=dev
ENV NEXT_TELEMETRY_DISABLED=1

# Add development labels
LABEL maintainer="TaskTracker Enterprise"
LABEL environment="development"
LABEL purpose="frontend-dev-cache-optimized"

# ✅ ENTERPRISE DEVELOPMENT OPTIMIZATIONS
# Install development dependencies
RUN apk add --no-cache \
    git \
    curl \
    bash \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory with proper permissions
WORKDIR /app
RUN chown -R node:node /app

# Switch to node user for security
USER node

# ✅ CACHE-OPTIMIZED DEPENDENCY INSTALLATION
# Copy package files
COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock* ./

# Install dependencies with development optimizations
RUN npm ci --include=dev --ignore-scripts && \
    npm cache clean --force

# ✅ DEVELOPMENT CACHE MANAGEMENT SETUP
# Copy cache management scripts
COPY --chown=node:node docker/scripts/dev-cache-manager.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/dev-cache-manager.sh

# ✅ SOURCE CODE COPY
# Copy source code
COPY --chown=node:node . .

# ✅ DEVELOPMENT BUILD CONFIGURATION
# Create development build with cache optimization
RUN npm run build:dev || npm run build

# ✅ DEVELOPMENT PORT AND HEALTH CHECK
EXPOSE 3000

# Health check for development container
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# ✅ DEVELOPMENT STARTUP
# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start development server with cache management
CMD ["/usr/local/bin/dev-cache-manager.sh"]

# ================================
# PRODUCTION BUILD STAGE
# ================================

FROM node:18-alpine AS builder

# Set production build environment
ENV NODE_ENV=production
ENV BUILD_ID=prod
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install production dependencies only
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY . .

# ✅ PRODUCTION BUILD WITH CACHE OPTIMIZATION
RUN npm run build

# ================================
# PRODUCTION RUNTIME STAGE
# ================================

FROM node:18-alpine AS production

# Set production environment
ENV NODE_ENV=production
ENV BUILD_ID=prod
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# ✅ PRODUCTION SERVICE WORKER OPTIMIZATION
# Copy optimized service worker files
COPY --from=builder --chown=nextjs:nodejs /app/public/sw.js ./public/
COPY --from=builder --chown=nextjs:nodejs /app/public/workbox-*.js ./public/

USER nextjs

EXPOSE 3000

# Production health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

# ✅ PRODUCTION STARTUP WITH CACHE HEADERS
CMD ["node", "server.js"] 