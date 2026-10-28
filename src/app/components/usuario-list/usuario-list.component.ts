import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UsuarioService } from '../../services/usuario.service';
import { UsuarioResponse } from '../../models/usuario.model';

@Component({
  selector: 'app-usuario-list',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioListComponent implements OnInit {
  private readonly service = inject(UsuarioService);

  items = signal<UsuarioResponse[]>([]);
  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  message = signal('');
  aviso = signal('');

  protected readonly vigencia = new FormControl<'activos' | 'desactivados'>('activos', { nonNullable: true });

  constructor() {
    this.vigencia.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.load());
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.message.set('');

    this.service.list(this.vigencia.value === 'desactivados' ? false : undefined).subscribe({
      next: (data) => {
        this.items.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(
          err.status === 0
            ? 'No hay conexión con el servidor'
            : (err.error?.detail ?? 'No fue posible cargar los usuarios'),
        );
        this.status.set('error');
      },
    });
  }

  reactivar(usuario: UsuarioResponse): void {
    this.aviso.set('');
    this.service.update(usuario.id, { activo: true }).subscribe({
      next: () => {
        this.aviso.set(`${usuario.nombre} fue reactivado y ya puede iniciar sesión.`);
        this.load();
      },
      error: (err: HttpErrorResponse) =>
        this.message.set(err.error?.detail ?? 'No fue posible reactivar el usuario'),
    });
  }

  desactivar(usuario: UsuarioResponse): void {
    if (!confirm(`¿Desactivar a ${usuario.nombre}?`)) {
      return;
    }
    this.service.delete(usuario.id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) =>
        this.message.set(err.error?.detail ?? 'No fue posible desactivar el usuario'),
    });
  }
}