FROM node:24-slim

# Declare a `/data` directory as a volume.
VOLUME /data

# Install dependencies for Chrome.
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    libnss3 \
    libxkbcommon0 \
    libgbm1 \
    libasound2 \
    fonts-liberation \
    ca-certificates

# Install `pnpm` using Core Pack.
RUN corepack enable && corepack prepare pnpm@latest --activate

# Use a non-root user.
USER node

# Declare a `/app` directory, this will be the working directory.
WORKDIR /app

# Copy code & config.
COPY package.json        .
COPY pnpm-lock.yaml      .
COPY pnpm-workspace.yaml .
COPY src                 ./src

# Enable server logging.
ENV DEBUG="home-trmnl:*"

# Configure the server host.
ENV HT_HOST="0.0.0.0"

# Disable sandbox rendering.
ENV HT_DISABLE_SANDBOX_RENDERING="true"

# Configure the browser executable for Puppeteer.
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

# Disable Puppeteer browser download.
ENV PUPPETEER_SKIP_DOWNLOAD="true"

# Install dependencies.
RUN pnpm install --frozen-lockfile --prod

# Expose application port (1992).
EXPOSE 1992

# Start the application.
CMD ["node", "/app/src/main.js", "/data/config.yaml"]
