# syntax=docker/dockerfile:1

# Claude-Mem Docker Image
# Multi-stage build for smaller image size

# =============================================================================
# Stage 1: Builder
# =============================================================================
FROM oven/bun:1 AS builder

# Install Node.js and npm for build scripts that require npm
RUN apt-get update && \
    apt-get install -y --no-install-recommends nodejs npm && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lock* ./

# Install all dependencies (including devDependencies for build)
RUN bun install

# Copy source files
COPY . .

# Build the project
RUN bun run build

# =============================================================================
# Stage 2: Production
# =============================================================================
FROM oven/bun:1-slim AS production

# Labels
LABEL org.opencontainers.image.title="claude-mem"
LABEL org.opencontainers.image.description="Persistent memory system for Claude Code"
LABEL org.opencontainers.image.source="https://github.com/customable/claude-mem"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Copy package files (don't copy lockfile to avoid lockfile mismatch issues)
COPY package.json ./

# Install production dependencies only
RUN bun install --production --no-save

# Copy built plugin files from builder
COPY --from=builder /app/plugin ./plugin

# Create data directory (bun image already has a non-root 'bun' user)
RUN mkdir -p /data && chown -R bun:bun /data

# Switch to non-root user
USER bun

# Environment variables
ENV NODE_ENV=production
ENV CLAUDE_MEM_DATA_DIR=/data
ENV CLAUDE_MEM_WORKER_PORT=37777
ENV CLAUDE_MEM_WORKER_BIND_ADDRESS=0.0.0.0

# Expose the worker port
EXPOSE 37777

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:37777/api/health || exit 1

# Start the worker service in foreground mode (--daemon runs in foreground)
CMD ["bun", "plugin/scripts/worker-service.cjs", "--daemon"]
