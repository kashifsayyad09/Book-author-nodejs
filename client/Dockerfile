# Stage 1: Build React app
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --no-audit --no-fund

COPY . .

# CRA's build (Terser minification) is memory-hungry, and source maps roughly
# double that cost — disable them and give Node explicit headroom so the
# build doesn't hit V8's heap limit inside memory-constrained containers.
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=2048

RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files to nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
