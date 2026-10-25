import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Punto de acceso temporal hasta integrar el listado H3 del compañero.

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-inicio-procesos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './inicio-procesos.component.html'
})
export class InicioProcesosComponent {
  private readonly router = inject(Router);
  readonly sinPermiso =
    inject(ActivatedRoute).snapshot.queryParamMap.get('aviso') === 'sin-permiso';
  readonly form = inject(FormBuilder).nonNullable.group({
    procesoId: [1, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]]
  });
  abrir(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.router.navigate(['/procesos', this.form.getRawValue().procesoId, 'pools']);
  }
}
