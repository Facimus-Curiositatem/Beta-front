import { HttpErrorResponse } from '@angular/common/http';

/**
 * Traduce un error HTTP a un mensaje para el usuario. El backend responde ProblemDetail
 * (title, detail, status); nunca se muestra err.message, que es tecnico.
 */
export function mensajeDeError(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'No hay conexion con el servidor. Revisa que el backend este encendido.';
  }
  if (err.status >= 500) {
    return 'Ocurrio un error en el servidor. Intenta de nuevo mas tarde.';
  }
  return err.error?.detail ?? err.error?.title ?? 'No se pudo completar la operacion.';
}
