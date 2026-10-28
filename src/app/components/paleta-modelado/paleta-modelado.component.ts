import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ElementoPaleta } from '../../models/diagrama.model';

interface GrupoPaleta {
  titulo: string;
  elementos: ElementoPaleta[];
}

const GRUPOS: GrupoPaleta[] = [
  {
    titulo: 'Actividades',
    elementos: [
      { tipo: 'ACTIVIDAD', subtipo: 'TAREA', etiqueta: 'Tarea' },
      { tipo: 'ACTIVIDAD', subtipo: 'USUARIO', etiqueta: 'Usuario' },
      { tipo: 'ACTIVIDAD', subtipo: 'SERVICIO', etiqueta: 'Servicio' },
      { tipo: 'ACTIVIDAD', subtipo: 'MANUAL', etiqueta: 'Manual' },
      { tipo: 'ACTIVIDAD', subtipo: 'SCRIPT', etiqueta: 'Script' },
      { tipo: 'ACTIVIDAD', subtipo: 'REGLA_NEGOCIO', etiqueta: 'Regla de negocio' }
    ]
  },
  {
    titulo: 'Gateways',
    elementos: [
      { tipo: 'GATEWAY', subtipo: 'EXCLUSIVO', etiqueta: 'Exclusivo' },
      { tipo: 'GATEWAY', subtipo: 'PARALELO', etiqueta: 'Paralelo' },
      { tipo: 'GATEWAY', subtipo: 'INCLUSIVO', etiqueta: 'Inclusivo' }
    ]
  }
];

@Component({
  selector: 'app-paleta-modelado',
  standalone: true,
  templateUrl: './paleta-modelado.component.html',
  styleUrl: './paleta-modelado.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaletaModeladoComponent {
  readonly deshabilitada = input(false);
  readonly elegido = input<ElementoPaleta | null>(null);
  readonly elegir = output<ElementoPaleta>();
  readonly arrastreIniciado = output<ElementoPaleta>();
  readonly arrastreTerminado = output<void>();

  protected readonly grupos = GRUPOS;

  iniciarArrastre(event: DragEvent, elemento: ElementoPaleta): void {
    if (event.dataTransfer) {
      // Firefox no inicia el arrastre si no hay datos en el dataTransfer.
      event.dataTransfer.setData('text/plain', elemento.etiqueta);
      event.dataTransfer.effectAllowed = 'copy';
    }
    this.arrastreIniciado.emit(elemento);
  }
}
