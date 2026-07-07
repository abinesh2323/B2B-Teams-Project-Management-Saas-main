FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts postcss.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src

RUN npm install
RUN npm run build

FROM nginx:stable-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
