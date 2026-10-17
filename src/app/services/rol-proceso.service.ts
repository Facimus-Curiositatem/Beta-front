import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolProcesoVistaResponse } from '../models/rol-proceso.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RolProcesoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/roles`;

  listar(): Observable<RolProcesoVistaResponse[]> {
    return this.http.get<RolProcesoVistaResponse[]>(this.url);
  }
}
