# ──────────────────────────────────────────────
# ResQRoute — Multi-stage Docker Build
# ──────────────────────────────────────────────

# ── Stage 1: Dependencies ─────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/types/package.json packages/types/
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN npm ci --ignore-scripts

# ── Stage 2: Build Types Package ──────────────
FROM deps AS types-builder
WORKDIR /app
COPY packages/types/ packages/types/
RUN npm run build --workspace=packages/types

# ── Stage 3: Build Web App ────────────────────
FROM types-builder AS web-builder
WORKDIR /app
COPY apps/web/ apps/web/
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/web

# ── Stage 4: Build API ───────────────────────
FROM types-builder AS api-builder
WORKDIR /app
COPY apps/api/ apps/api/
RUN npm run build --workspace=apps/api 2>/dev/null || true

# ── Stage 5: Production Web ──────────────────
FROM node:20-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=web-builder /app/apps/web/.next/standalone ./
COPY --from=web-builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=web-builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

# ── Stage 6: Production API ──────────────────
FROM node:20-alpine AS api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/apps/api ./apps/api
COPY --from=api-builder /app/packages ./packages
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
