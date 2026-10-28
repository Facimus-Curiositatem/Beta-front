import { Component, ChangeDetectionStrategy, computed, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoService } from '../../services/proceso.service';
import { TokenService } from '../../services/token.service';
import { EstadoProceso, ProcesoResponse } from '../../models/proceso.model';

@Component({
  selector: 'app-proceso-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './proceso-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcesoListComponent {
  private readonly fb = inject(FormBuilder);
  private readonly procesoService = inject(ProcesoService);
  private readonly router = inject(Router);
  private readonly tokens = inject(TokenService);

  aviso = input<string>();

  protected readonly soloLectura = computed(() => this.tokens.rol() === 'SOLO_LECTURA');

  protected readonly estados: EstadoProceso[] = ['BORRADOR', 'PUBLICADO'];
  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly items = signal<ProcesoResponse[]>([]);
  protected readonly message = signal('');
  protected readonly pagina = signal(0);
  protected readonly totalPages = signal(0);

  protected readonly filtros = this.fb.nonNullable.group({
    nombre: [''],
    estado: this.fb.nonNullable.control<EstadoProceso | ''>(''),
    categoria: [''],
    vigencia: this.fb.nonNullable.control<'activos' | 'inactivos'>('activos')
  });

  ngOnInit(): void {
    this.load();
  }

  buscar(): void {
    this.pagina.set(0);
    this.load();
  }

  load(): void {
    this.status.set('loading');
    const { nombre, estado, categoria, vigencia } = this.filtros.getRawValue();
    // Sin filtro el backend lista solo los activos; los eliminados se consultan aparte.
    const activo = vigencia === 'inactivos' ? false : undefined;
    this.procesoService.buscar(nombre, estado || undefined, categoria, activo, this.pagina()).subscribe({
      next: page => {
        this.items.set(page.content);
        this.totalPages.set(page.totalPages);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible cargar los procesos');
        this.status.set('error');
      }
    });
  }

  anterior(): void {
    if (this.pagina() > 0) {
      this.pagina.update(p => p - 1);
      this.load();
    }
  }

  siguiente(): void {
    if (this.pagina() + 1 < this.totalPages()) {
      this.pagina.update(p => p + 1);
      this.load();
    }
  }

  ver(id: number): void {
    this.router.navigate(['/procesos', id]);
  }
}
