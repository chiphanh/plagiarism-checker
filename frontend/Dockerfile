FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json pnpm-lock.yaml ./

# Install dependencies using Yarn
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN pnpm build

# Define the port the container will listen on
EXPOSE 3000

# Start the Next.js server
ENTRYPOINT ["pnpm", "start"]