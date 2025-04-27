#####################
### Development build
#####################
FROM node:22.14.0-alpine AS development

RUN apk add --no-cache libc6-compat

USER node

WORKDIR /app

ENV NODE_ENV=development

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . ./

RUN npx prisma generate

#####################
### Production build
#####################
FROM node:22.14.0-alpine AS build

USER node

WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /app/node_modules node_modules
COPY --chown=node:node --from=development /app/src/generated/prisma /app/src/generated/prisma
COPY --chown=node:node . ./

RUN ["npm", "run", "build"]

RUN npm ci --only=production --omit=dev && npm cache clean --force

#####################
### Production
#####################
FROM node:22.14.0-alpine AS production

RUN apk add --no-cache libc6-compat

USER node

WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=build /app/src/generated/prisma /app/src/generated/prisma
COPY --chown=node:node --from=build /app/dist dist
COPY --chown=node:node --from=build /app/node_modules node_modules

RUN ["npm", "run", "start:prod"]
