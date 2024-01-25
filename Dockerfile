# Author: ProgramZmh
# License: Apache-2.0
# Description: Dockerfile for chatnio

FROM golang:1.20-alpine AS backend

WORKDIR /backend
COPY . .

# Set go proxy to https://goproxy.cn (open for vps in China Mainland)
# RUN go env -w GOPROXY=https://goproxy.cn,direct
ENV GOOS=linux GO111MODULE=on CGO_ENABLED=1

# Install dependencies for cgo
RUN apk add --no-cache gcc musl-dev

# Build backend
RUN go install && \
    go build .

FROM node:18 AS frontend

WORKDIR /app
COPY ./app .

RUN npm install -g pnpm && \
    pnpm install && \
    pnpm run build && \
    rm -rf node_modules src


FROM alpine

# Install dependencies
RUN apk update && \
    apk upgrade && \
    apk add --no-cache wget ca-certificates tzdata && \
    update-ca-certificates 2>/dev/null || true && \
    rm -rf /var/cache/apk/*

# Set timezone
RUN echo "Asia/Shanghai" > /etc/timezone && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /

# Copy dist
COPY --from=backend /backend /
COPY --from=frontend /app/dist /app/dist

# Expose port
EXPOSE 8094

# Run application
CMD ["./chat"]
