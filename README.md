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

La aplicacion abre en `http://localhost:4200`. Usuarios de demostracion que crea el backend en el perfil por defecto:

| Empresa | Correo | Contrasena |
|---|---|---|
| Empresa Demo S.A.S. | `admin@demo.com` | `admin123` |
| Empresa Beta S.A.S. | `admin@beta.com` | `admin123` |

La URL de la API se configura en `src/environments/environment.ts`.

## Estructura

```
src/app/
  components/    componentes compartidos (navbar)
  guards/        authGuard: sin token no se entra a las paginas privadas
  interceptors/  authInterceptor (Bearer) y errorInterceptor (401 -> login)
  models/        interfaces con los mismos nombres que los DTO del backend
  pages/         una carpeta por pagina (login, lista y formulario de procesos)
  service/       llamadas HTTP y manejo del token
  utils/         mensajes de error a partir de ProblemDetail
```

## Compilacion

```bash
ng build --configuration production
```

El resultado queda en `dist/beta-front/browser/`.
