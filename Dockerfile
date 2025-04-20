FROM node:22-alpine AS development
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
CMD ["npm", "run", "start:dev"]

FROM node:22-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=development /app/dist ./dist
CMD ["node", "dist/main"]
