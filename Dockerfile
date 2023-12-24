# ref nodejs v18 and golang v1.20

FROM node:18-alpine as builder
FROM golang:1.20-alpine as builder-go

FROM alpine:3.15

# Install nginx
RUN apk add --no-cache nginx && \
    mkdir -p /run/nginx \
    mkdir -p /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Install nodejs
COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder /usr/local/include/node /usr/local/include/node
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=builder /usr/local/share/doc/node /usr/local/share/doc/node

# Install golang
COPY --from=builder-go /usr/local/go /usr/local/go
ENV GOOS=linux GOARCH=amd64

WORKDIR /

# Copy source code
COPY . .

# Build backend
RUN go build -o chatnio

# Build frontend
RUN cd /app && \
    npm install -g pnpm && \
    pnpm install && \
    pnpm run build && \
    rm -rf node_modules

# Copy frontend
RUN ls -la /app
COPY --from=0 /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Start backend
CMD ["chatnio"]
