# Etapa 1: compilar el Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# Etapa 2: servir con nginx (y reenviar /api al backend)
FROM nginx:1.27-alpine
# La plantilla se procesa al arrancar: ${BACKEND_URL} se reemplaza por la variable de entorno
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/beta-front/browser /usr/share/nginx/html
ENV BACKEND_URL=http://10.43.99.37:8080
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
