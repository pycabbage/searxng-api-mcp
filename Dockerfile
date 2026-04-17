FROM oven/bun:1.3.12-alpine AS builder

WORKDIR /app

RUN \
  --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=bun.lock,target=bun.lock \
  bun install --frozen-lockfile

COPY . .
RUN \
  bun build --bytecode --minify --sourcemap \
  --target=bun \
  --compile \
  ./src/cli.ts --outfile=./dist/cli

FROM oven/bun:1.3.12-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist/cli /app/cli
CMD ["./cli"]
