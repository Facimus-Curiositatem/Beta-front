# Guía de sustentación: aspecto visual de BETA

## Qué se hizo y con qué

Se aplicó un diseño sencillo a la aplicación existente: fondo gris claro,
contenido blanco, navegación azul, controles consistentes y tablas que pueden
desplazarse horizontalmente. Se usó HTML y CSS propio dentro del proyecto Angular.
No se instalaron bibliotecas, fuentes ni paquetes nuevos.

La rama `feature/35-pulido-visual` se creó desde `origin/main` en `0dc05d3`.
Este trabajo corresponde al pulido visual del issue #35 y abarca las pantallas
de acceso, usuarios, procesos, roles, permisos, estructura, elementos BPMN,
compartición y modelador. Las pantallas heredan estilos comunes aunque su HTML
no haya requerido cambios.

## Paleta y decisiones

| Color | Uso | Motivo |
| --- | --- | --- |
| `#f3f5f7` | Fondo | Separar el contenido de la página |
| `#ffffff` | Formularios y paneles | Facilitar la lectura |
| `#243746` | Texto | Contraste sobre fondo claro |
| `#235789` | Acciones y enlaces | Identidad azul compartida |
| `#193d5b` | Menú y títulos | Dar jerarquía a la navegación |
| `#d5dde5` | Bordes | Delimitar sin recargar |
| `#b42318` | Errores y acciones destructivas | Llamar la atención junto al texto |
| `#21643c` | Confirmaciones y reactivación | Diferenciar resultados positivos |

El color acompaña mensajes y nombres de acciones. Un botón sigue diciendo
“Eliminar”; no se depende solamente de verlo rojo.

## Archivos que conviene presentar

Las rutas de esta tabla parten de `src/`.

| Archivo o grupo | Qué mostrar | Cómo explicarlo |
| --- | --- | --- |
| `styles.css` | `:root`, formularios, botones y tablas | “Centralicé lo que se repite entre pantallas.” |
| `app/app.component.html` y `.css` | Marca BETA, menú con Flexbox, enlace activo | “El menú puede pasar a varias líneas cuando no cabe.” |
| `app/components/login/login.component.html` | Marca, descripción, autocomplete y mensaje | “Se conserva el formulario reactivo y se aclara la presentación.” |
| `app/components/proceso-list/proceso-list.component.html` | Clase `filtros` y contenedor `tabla-scroll` | “Los filtros se organizan con Grid y la tabla tiene su propio desplazamiento.” |
| Listas de usuarios, roles, pools, lanes, actividades, gateways, eventos, arcos y mensajes | Mismo contenedor de tablas y clases de acciones | “Reutilicé el mismo criterio en las demás listas.” |
| Permisos de estructura, compartir, compartidos y detalle compartido | Tablas envueltas y clase `permisos` | “Las matrices anchas aprovechan el panel y pueden desplazarse.” |
| Formularios de usuario, invitación y aceptación | Pares `for` / `id` | “La etiqueta queda asociada al control, también al pulsarla.” |
| `app/components/diagrama-proceso/diagrama-proceso.component.css` | Media queries de 1000 y 640 px | “Cambio de lugar los paneles, conservando las coordenadas del lienzo.” |
| `app/components/paleta-modelado/paleta-modelado.component.css` | Media query de 640 px | “La paleta pasa a dos columnas para ocupar menos alto.” |

No es necesario abrir todos los HTML durante la sustentación. Mostrar un ejemplo
de lista y explicar dónde se repite permite dedicar tiempo al motivo del cambio.

## Explicación del CSS con ejemplos reales

### Variables: cambiar un color en un solo lugar

En `:root` se declara `--acento: #235789`. Cuando un botón usa
`background: var(--acento)`, toma ese valor. Cambiar la variable actualiza las
reglas que la utilizan; evita copiar el mismo hexadecimal por todas partes.

### Flexbox en el menú

`display: flex` coloca los enlaces uno junto a otro. `gap` los separa.
`flex-wrap: wrap` permite que bajen de línea cuando se acaba el espacio.
En móvil, la marca ocupa una línea y el botón de cerrar sesión deja de empujarse
al extremo derecho con `margin-left: auto`.

### Grid en filtros y formularios

`display: grid` organiza los controles con espacios consistentes.
En filtros, `repeat(auto-fit, minmax(160px, 1fr))` crea tantas columnas como
quepan: cada una debe medir al menos 160 px y comparte el espacio sobrante.
Hasta 640 px se indica una sola columna para facilitar su uso.

### Tablas en pantallas pequeñas

La tabla conserva sus columnas. Un `div.tabla-scroll` a su alrededor usa
`overflow-x: auto`: si el contenido es más ancho, el desplazamiento ocurre dentro
de ese contenedor. `tabindex="0"` permite enfocarlo con teclado y `aria-label`
da nombre a la región. Esto no elimina columnas ni transforma la tabla en tarjetas.

### Validación y estados

Angular ya coloca las clases `ng-invalid` y `ng-touched`. El CSS las utiliza
para poner un borde rojo después de interactuar con un campo inválido.
El CSS no valida el correo: esa validación sigue en el formulario y en el backend.
Los mensajes existentes de error, carga y confirmación reciben una apariencia común.
`role="status"` identifica mensajes de estado; `role="alert"` identifica avisos.

### Foco de teclado

`:focus-visible` dibuja un contorno cuando el control debe mostrar el foco,
por ejemplo al navegar con Tab. Indica qué elemento recibirá la próxima acción.
No equivale a que el campo tenga un error.

### Selectores que pueden preguntar

`main:has(app-login)` significa “el main que contiene el componente de login”.
Permite darle un ancho menor que al listado. `form:not(.formulario-panel)` aplica
la distribución común excepto a los paneles que ya tienen su distribución.
Son selectores de CSS; no son directivas de Angular. `:has` requiere un navegador
moderno, como las versiones actuales de Chrome, Firefox y Safari.

### Por qué el modelador tiene CSS propio

Angular encapsula los estilos de los componentes añadiendo atributos a sus
selectores. Una regla global puede perder frente a la regla del componente.
Por eso las media queries del modelador van en su propio archivo, después de las
reglas de escritorio. A 1000 px el panel baja; a 640 px la paleta también queda
en una fila propia. El lienzo mantiene desplazamiento y sus dimensiones originales.
No se está afirmando que editar un diagrama en teléfono sea igual que en escritorio.

Los estilos generales de campos se limitan a `form`, porque el editor de nombres
del lienzo es un input independiente y necesita conservar su tamaño especial.

## Speech de aproximadamente un minuto

“Mi trabajo en esta entrega fue dar una apariencia coherente a las vistas de BETA.
Partí de main y creé una rama para el issue 35. Elegí azul para la navegación y las
acciones, blanco para los paneles y gris claro para el fondo. Usé CSS propio y la
tipografía del sistema para mantener la solución sencilla.

En styles.css agrupé colores, campos, botones, mensajes y tablas. En el componente
principal adapté el menú con Flexbox. En los listados agregué un contenedor para
desplazar tablas anchas. Para pantallas pequeñas utilicé media queries y, en el
modelador, reorganicé los paneles manteniendo las coordenadas del diagrama.

La compilación de producción y los tipos de las pruebas pasaron. Las pruebas de
navegador y la comprobación visual quedaron pendientes por restricciones del
entorno, y esa limitación está documentada en el PR.”

## Flashcards para repasar

| Pregunta | Respuesta corta |
| --- | --- |
| ¿Qué es look and feel aquí? | La apariencia y la forma de percibir y usar las pantallas: colores, espacios, controles y estados. |
| ¿Por qué CSS global? | Para que las pantallas compartan reglas sin copiarlas en cada componente. |
| ¿Por qué también CSS de componente? | Para la navegación y la distribución particular del modelador; evita mezclar sus detalles con todas las vistas. |
| ¿Qué hace una media query? | Aplica reglas cuando se cumple una condición, aquí un ancho máximo de pantalla. |
| ¿Qué hace overflow-x? | Controla el contenido que se sale horizontalmente; auto permite desplazamiento cuando hace falta. |
| ¿El CSS valida el formulario? | No. Solo muestra visualmente el estado que ya calcula Angular. |
| ¿Se modificó OnPush, signals, inject o JWT? | No se modificó TypeScript. El cambio utiliza los estados y bindings existentes. |
| ¿Por qué no agregar una librería visual? | El alcance se resolvía con CSS propio y sin añadir dependencias que el equipo deba mantener. |

## Validación y límites de esta entrega

- `npm run build -- --configuration production`: aprobado. Advierte que el CSS
  del modelador ocupa 4.28 kB, 279 bytes por encima del umbral de aviso de 4 kB;
  no supera el límite de error. Se conserva el presupuesto configurado del proyecto.
- `npx tsc -p tsconfig.spec.json --noEmit`: aprobado.
- `git diff --check`: aprobado.
- Suite existente con `ChromeHeadlessCI`: compiló, pero Chromium no pudo iniciar
  por `socket() failed: Operation not permitted`. No hay resultado de ejecución
  de las pruebas; no se cuenta como suite aprobada.
- Inspección visual: pendiente. El navegador de revisión quedó bloqueado al
  intentar acceder al entorno local. No se verificó el recorrido contra el backend.
- Revisión de código adicional: se corrigieron conflictos de cascada que impedían
  el cambio de columnas y afectaban al editor de nombres del modelador.

Antes de integrar, revisar login y errores de formulario, listas y tablas anchas,
matriz de permisos, compartidos, menú y modelador tanto a 1280 px como a 390 px.
En el modelador comprobar además el cambio de columnas a 1000 px, escribir un
nombre y arrastrar un lane. Para ejecutar localmente usar `npm ci` y `npm start`;
el acceso a datos requiere que el backend configurado esté disponible.
