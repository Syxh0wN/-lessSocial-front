FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json backend/
COPY shared/package.json shared/
RUN npm ci
COPY shared shared
COPY backend backend
RUN npx prisma generate --schema backend/prisma/schema.prisma
RUN npm run build --workspace shared
RUN npm run build --workspace backend
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/shared/package.json ./shared/package.json
COPY --from=builder /app/shared/dist ./shared/dist
EXPOSE 3000
CMD ["npm", "run", "start:prod", "--workspace", "backend"]
