import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NodoDiagrama } from '../../models/diagrama.model';

const MARCADORES: Partial<Record<NodoDiagrama['subtipo'], string>> = {
  USUARIO: 'Usuario',
  SERVICIO: 'Servicio',
  MANUAL: 'Manual',
  SCRIPT: 'Script',
  REGLA_NEGOCIO: 'Regla de negocio'
};

@Component({
  selector: 'app-nodo-diagrama',
  standalone: true,
  templateUrl: './nodo-diagrama.component.html',
  styleUrl: './nodo-diagrama.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodoDiagramaComponent {
  readonly nodo = input.required<NodoDiagrama>();

  protected readonly marcador = computed(() => MARCADORES[this.nodo().subtipo] ?? '');
}
