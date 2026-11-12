FROM node:22.22.3 AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:22.22.3 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock./

COPY --from=builder app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/infrastructure/mail/templates ./dist/src/infrastructure/mail/template

CMD ["node", "dist/main"]
