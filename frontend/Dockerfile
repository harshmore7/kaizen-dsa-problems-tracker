FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=1024" \
    GENERATE_SOURCEMAP=false \
    npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy as the MAIN nginx config, not conf.d
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80