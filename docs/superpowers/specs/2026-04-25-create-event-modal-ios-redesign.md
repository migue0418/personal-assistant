# Spec: Rediseño CreateEventModal — estilo iOS Calendar

**Fecha:** 2026-04-25
**Feature:** weekly-planning
**Archivos afectados:** `CreateEventModal.tsx`, `ReminderPicker.tsx`

---

## Contexto

El formulario actual de creación de tarea usa un bottom sheet con inputs individuales con bordes, una sección de checkboxes para recordatorios y botones de acción en la parte inferior. Visualmente resulta genérico y sin jerarquía clara.

El objetivo es rediseñarlo para que se asemeje al formulario de creación de evento del calendario de iOS: fondo gris, campos agrupados en "cards" blancas redondeadas, barra de navegación superior con acciones de texto y chips de selección múltiple para los recordatorios.

---

## Diseño

### Estructura general

Modal casi fullscreen (mantiene `fixed inset-0 z-50 flex items-end`). El contenedor interior ocupa `max-h-[96vh]`, scroll vertical habilitado, con fondo `--color-surface-variant` en lugar del blanco actual.

```
┌──────────────────────────────────────┐
│  Cancelar    Nuevo evento    Guardar  │  ← nav bar
├──────────────────────────────────────┤
│                                      │  ← fondo surface-variant
│  ┌────────────────────────────────┐  │
│  │  Título del evento             │  │  card 1: título
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Fecha          vie, 25 abr     │  │  card 2: fecha y horas
│  │ ─────────────────────────────  │  │
│  │ Inicio                  10:00  │  │
│  │ ─────────────────────────────  │  │
│  │ Fin                     11:00  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Categoría           Trabajo  › │  │  card 3: categoría
│  └────────────────────────────────┘  │
│                                      │
│  RECORDATORIOS                       │  ← label sección
│  ┌────────────────────────────────┐  │
│  │ [10 min] [1 hora] [1 día] [1 sem] │  card 4: chips recordatorios
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Se repite              No   ●○ │  │  card 5: toggle repetición
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

### Nav bar superior

Reemplaza los botones de acción del fondo. Estructura:

```
flex items-center justify-between px-4 pt-4 pb-2
```

- **"Cancelar"** — izquierda, `text-[--color-primary] text-[17px]`, `onClose`
- **"Nuevo evento"** — centro, `text-[15px] font-semibold text-[--color-text-primary]`
- **"Guardar"** — derecha, `text-[--color-primary] text-[17px] font-semibold`, submit del form

Los botones de acción del fondo (`flex gap-3 pt-2`) se eliminan completamente.

---

### Sistema de cards (iOS grouped table view)

Cada grupo de campos vive en un card:

```
rounded-xl bg-[--color-surface]   ← contenedor card
```

Sin sombra, sin borde exterior. Separación entre cards: `mb-3` o `space-y-3` en el contenedor.

**Row estándar:**
```
min-h-[52px] px-4 flex items-center justify-between
```

**Divisor interno entre rows:**
```
border-b style={{ borderColor: 'var(--color-border)' }}
```
Solo entre rows, nunca en el último row de la card.

**Tipografía de row:**
- Label izquierda: `text-[17px]` + `color: var(--color-text-primary)`
- Valor derecha: `text-[17px]` + `color: var(--color-text-secondary)` + `text-right`

---

### Card 1 — Título

Card con un solo input full-width. Sin label visible.

```
<input
  placeholder="Título"
  className="w-full px-4 py-3.5 text-[17px] bg-transparent outline-none"
/>
```

El placeholder usa `--color-text-secondary`. El texto escrito usa `--color-text-primary`.

---

### Card 2 — Fecha y hora

Tres rows con label izquierda e `<input type>` derecha:

| Row | Label | Input type | Valor ejemplo |
|---|---|---|---|
| 1 | Fecha | `date` | `vie, 25 abr` → input nativo |
| 2 | Inicio | `time` | `10:00` |
| 3 | Fin | `time` | `11:00` |

Los inputs nativos se estilan con `text-right text-[--color-text-secondary]`, sin borde propio. El row actúa como el contenedor táctil.

Error de validación (hora fin ≤ inicio): aparece como un row adicional de texto `text-xs text-[--color-current-time]` debajo de la card, no dentro de ella.

---

### Card 3 — Categoría

Un row con label "Categoría" a la izquierda y un `<select>` estilado a la derecha.

El `<select>` native queda invisible visualmente (opacity 0, position absolute) y encima se renderiza el valor seleccionado + chevron `›` en `--color-text-secondary`. Al pulsar el row completo, se abre el select nativo.

Implementación: `<select>` con `text-right text-[--color-text-secondary] bg-transparent border-none outline-none appearance-none`, sin chevron adicional.

---

### Card 4 — Recordatorios (chips multi-select)

Encabezado de sección (fuera de la card):
```
text-xs font-semibold uppercase tracking-wider
color: var(--color-text-secondary)
mb-2 px-1
```

Contenido de la card: `flex flex-wrap gap-2 p-4`

**Chip inactivo:**
```
rounded-full px-4 py-2 text-sm font-medium
backgroundColor: var(--color-surface-variant)
color: var(--color-text-secondary)
```

**Chip activo:**
```
rounded-full px-4 py-2 text-sm font-medium
backgroundColor: var(--color-primary)
color: white
```

**Chip deshabilitado** (offset requiere `timeStart` y no hay hora):
```
opacity: 0.4   cursor-not-allowed
```

Etiquetas: `"10 min"`, `"1 hora"`, `"1 día"`, `"1 semana"` (cortas, sin "antes").

Touch target mínimo: los chips tienen `min-h-[36px]` — aceptable porque el área táctil del `flex-wrap` los separa suficientemente. No hace falta forzar 44px en chips de selección múltiple.

**Cambios en `ReminderPicker.tsx`:**
El componente recibe las mismas props (`selected`, `hasTimeStart`, `onChange`). Solo cambia el render: de checkboxes a chips. El componente se renombra o se mantiene con el mismo nombre.

---

### Card 5 — Se repite

Row con toggle switch iOS en lugar del checkbox actual.

**Toggle switch** implementado como `<button role="switch">`:
```
w-[51px] h-[31px] rounded-full relative transition-colors
```
- Off: `backgroundColor: var(--color-surface-variant)` o gris (#E5E5EA)
- On: `backgroundColor: var(--color-primary)`
- Thumb: div blanco `w-[27px] h-[27px] rounded-full bg-white shadow` con `translate-x-0` (off) / `translate-x-[20px]` (on), transición 200ms

Cuando el toggle está activo, las opciones de recurrencia se despliegan como rows adicionales **dentro de la misma card**, separados por divisores internos. El comportamiento y validación de recurrencia no cambia.

El mensaje "Los recordatorios no están disponibles para tareas recurrentes" aparece como texto debajo de la card de recordatorios cuando `isRecurring === true`, en `text-xs text-[--color-text-secondary]`.

---

## Cambios de implementación

### `CreateEventModal.tsx`

1. Eliminar: `flex gap-3 pt-2` (sección botones abajo)
2. Añadir: nav bar superior con "Cancelar" / título / "Guardar"
3. Cambiar: `style={{ backgroundColor: 'var(--color-surface)' }}` del contenedor → `var(--color-surface-variant)`
4. Envolver cada grupo de campos en una card `rounded-xl bg-[var(--color-surface)]`
5. Convertir cada campo a layout `label-izquierda + input-derecha` dentro de rows con divisores internos
6. Reemplazar `<input type="checkbox">` de "Se repite" por toggle switch
7. Ajustar padding superior: la `p-6` actual → `pt-0 px-4 pb-6` (el nav bar maneja el padding top)
8. Handle bar (drag indicator): mantener, moverlo dentro del nav bar o eliminarlo (iOS no lo usa — eliminar)

### `ReminderPicker.tsx`

Reescritura del render: de lista de checkboxes a `flex flex-wrap gap-2`. Las props no cambian.

---

## Qué NO cambia

- Lógica de validación del formulario
- Lógica de guardado y llamadas a `planningRepo`
- Lógica de recordatorios (`scheduleReminders`, `remindersRepo`)
- Tipos TypeScript
- Comportamiento de recurrencia
- Accesibilidad básica (labels, roles)

---

## Verificación

1. `npm run build` sin errores TypeScript
2. Abrir la app en móvil (390px): verificar que el modal ocupa casi toda la pantalla, scroll funciona, chips tienen buen touch target
3. Crear una tarea sin hora: chips "10 min" y "1 hora" aparecen deshabilitados
4. Crear una tarea con hora: seleccionar múltiples chips, guardar, verificar que los recordatorios se crean en IndexedDB
5. Activar "Se repite": verificar que el toggle switch cambia de estado y aparecen las opciones de frecuencia
6. Verificar que el error de validación (hora fin ≤ inicio) sigue mostrándose correctamente
