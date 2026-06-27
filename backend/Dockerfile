FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including dev) and ignore peer dependency conflicts
RUN npm install --legacy-peer-deps

COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies before copying to production image
RUN npm prune --omit=dev

FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "dist/index.js"]