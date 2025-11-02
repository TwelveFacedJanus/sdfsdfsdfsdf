# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install bun (if present), otherwise use npm or yarn
RUN if [ -f "bun.lock" ]; then npm install -g bun && bun install; \
    elif [ -f "yarn.lock" ]; then yarn install --frozen-lockfile; \
    elif [ -f "pnpm-lock.yaml" ]; then npm install -g pnpm && pnpm install; \
    else npm install; fi

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set memory limit for Node.js during build - pass it directly to the command
RUN NODE_OPTIONS="--max-old-space-size=4096" sh -c 'if [ -f "bun.lock" ]; then npm install -g bun && bun run build; elif [ -f "yarn.lock" ]; then yarn build; elif [ -f "pnpm-lock.yaml" ]; then npm install -g pnpm && pnpm build; else npm run build; fi' && \
    ls -la .next && \
    test -f .next/BUILD_ID || (echo "Build failed - BUILD_ID not found" && exit 1)

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Check if .next directory exists before starting
# If using volume mounts in development, check for build or use dev mode
RUN if [ ! -f ".next/BUILD_ID" ]; then \
    echo "Warning: Production build not found. Consider using dev mode with volume mounts."; \
    fi

# Use dev mode if BUILD_ID doesn't exist, otherwise use production
CMD sh -c 'if [ ! -f ".next/BUILD_ID" ]; then echo "Starting in dev mode..." && npm run dev; else echo "Starting in production mode..." && node_modules/.bin/next start; fi'
