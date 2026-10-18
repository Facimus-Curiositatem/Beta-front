import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-usuario-list',
  imports: [NgFor, RouterLink],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css',
})
export class UsuarioListComponent implements OnInit {
  private service = inject(UsuarioService);

  items = signal<Usuario[]>([]);
  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  message = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.message.set('');

    this.service.list().subscribe({
      next: (data) => {
        this.items.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible cargar los usuarios');
        this.status.set('error');
      },
    });
  }

  desactivar(usuario: Usuario): void {
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