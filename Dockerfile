FROM centos:7.8.2003

# Install dependencies
RUN yum -y update && \
    yum install -y epel-release gcc make nginx libgcc libstdc++ wget

COPY nginx.conf /etc/nginx/nginx.conf

# Install golang
RUN wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz && \
    rm -rf /usr/local/go && tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz && \
    rm -rf go1.21.5.linux-amd64.tar.gz

# Install nodejs
RUN wget https://nodejs.org/dist/v16.14.0/node-v16.14.0-linux-x64.tar.xz && \
    rm -rf /usr/local/node && tar -C /usr/local -xJf node-v16.14.0-linux-x64.tar.xz && \
    rm -rf node-v16.14.0-linux-x64.tar.xz && \
    mv /usr/local/node-v16.14.0-linux-x64 /usr/local/node

ENV PATH=$PATH:/usr/local/go/bin:/usr/local/node/bin

# Install npm
RUN npm install -g pnpm


# Copy source code
COPY . .

# Set ulimit in container and max open files
RUN ulimit -n 65535 && \
    echo "* soft nofile 65535" >> /etc/security/limits.conf && \
    echo "* hard nofile 65535" >> /etc/security/limits.conf && \
    echo "ulimit -n 65535" >> /etc/profile && \
    echo "ulimit -n 65535" >> /etc/rc.local

# set go proxy to https://goproxy.cn (open for vps in China Mainland)
# RUN go env -w GOPROXY=https://goproxy.cn,direct
ENV GOOS=linux GOARCH=amd64 GO111MODULE=on CGO_ENABLED=1

# Build backend
RUN go install && \
    go build .

# Build frontend
RUN cd /app && \
    pnpm install && \
    pnpm run build && \
    rm -rf node_modules

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Start backend
CMD ["./chat"]
