/** Errores del backend: ProblemDetail (RFC 9457). */
export interface ProblemDetail {
  title?: string;
  status?: number;
  detail?: string;
}
