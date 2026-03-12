FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Increase Node memory to 4GB for monaco-editor build
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80