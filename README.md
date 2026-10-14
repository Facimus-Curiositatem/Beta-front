# Facimus Procesos — Frontend

SPA en Angular 19 que consume la API REST del backend (`Beta-back`).

## Requisitos

- Node.js LTS compatible con Angular 19 (20 o 22)
- Angular CLI 19: `npm i -g @angular/cli@19.2.23`
- Backend corriendo en `http://localhost:8080` (perfil por defecto)

## Ejecucion local

```bash
npm install
ng serve
```

La aplicacion abre en `http://localhost:4200`. Usuarios de demostracion que crea el backend en el perfil por defecto: `admin@demo.com` y `admin@beta.com`, ambos con `admin123`.

La URL de la API se configura en `src/environments/`.

## Estructura

```
src/app/
  guards/        authGuard: sin token no se entra a las paginas privadas
  interceptors/  authInterceptor: Bearer hacia la API y 401 -> login
  models/        interfaces con los mismos nombres que los DTO del backend
  pages/         una carpeta por pagina (login, home)
  service/       llamadas HTTP (AuthService) y manejo de la sesion (TokenService)
```
