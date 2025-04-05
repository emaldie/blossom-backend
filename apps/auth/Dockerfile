FROM node:alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm cache clean --force
RUN npm ci

COPY --chown=node:node . .

RUN npm run build

FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm install --only=production

COPY . .

COPY --chown=node:node --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/api-gateway/main"]