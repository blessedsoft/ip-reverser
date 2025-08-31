# Stage 1: Build the React app
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy the React build to NGINX html folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx.conf (we’ll create it next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
