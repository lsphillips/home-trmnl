FROM node:24-slim

# Declare a `/data` directory as a volume.
VOLUME /data

# Install dependencies for Chrome.
RUN apt-get update && apt-get install -y --no-install-recommends \
	libglib2.0-0 \
	libnspr4 \
	libnss3 \
	libdbus-1-3 \
	libatk1.0-0 \
	libatk-bridge2.0-0 \
	libcups2 \
	libexpat1 \
	libxkbcommon0 \
	libxcomposite1 \
	libxdamage1 \
	libxfixes3 \
	libxrandr2 \
	libgbm1 \
	libcairo2 \
	libpango-1.0-0 \
	libasound2

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

# Install dependencies.
RUN pnpm install --frozen-lockfile --prod

# Expose application port (1992).
EXPOSE 1992

# Enable server logging.
ENV DEBUG="home-trmnl:*"

# Configure the server host.
ENV HOST="0.0.0.0"

# Disable sandbox rendering.
ENV DISABLE_SANDBOX_RENDERING="true"

# Start the application.
CMD ["node", "/app/src/main.js", "/data/config.yaml"]
