# Multi-stage: build then copy binary only
FROM node:22-alpine AS builder
WORKDIR /build
COPY packages/core/ packages/core/
COPY packages/cli/ packages/cli/
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY tooling/ tooling/
RUN corepack enable && pnpm install --frozen-lockfile && pnpm build:core && pnpm build:cli

# Runtime: minimal image
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /build/packages/cli/dist/ ./dist/
COPY --from=builder /build/packages/cli/node_modules/ ./node_modules/
COPY --from=builder /build/packages/core/dist/ ./core-dist/
ENTRYPOINT ["node", "/app/dist/index.js"]

LABEL org.opencontainers.image.source="https://github.com/hammadxcm/tokx"
LABEL org.opencontainers.image.description="JWT decode, encode, verify from your terminal"
LABEL org.opencontainers.image.licenses="MIT"
