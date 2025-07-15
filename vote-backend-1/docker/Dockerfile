FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install dependencies for development
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Create uploads directory for file uploads
RUN mkdir -p uploads && chown -R node:node uploads

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start in development mode with hot reload
CMD ["npm", "run", "start:dev"]