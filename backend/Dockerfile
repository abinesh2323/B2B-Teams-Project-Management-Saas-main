FROM node:20-alpine AS build
WORKDIR /app

COPY package.json tsconfig.json ./
COPY src ./src

RUN npm install
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

RUN npm install --production

EXPOSE 8009
CMD ["node", "dist/index.js"]
