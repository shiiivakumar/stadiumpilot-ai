# Stage 1: Build front-end static assets
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Spin up Express backend secure server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/data/stadiumData.js ./src/data/stadiumData.js
COPY server.js ./

# Set environment variable for production
ENV NODE_ENV=production

# Cloud Run injects PORT, which the Node server reads dynamically
EXPOSE 8080
CMD ["node", "server.js"]
