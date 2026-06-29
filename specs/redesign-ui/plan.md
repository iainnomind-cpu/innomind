# Plan de Implementación: Rediseño Visual B2B (Fase 1)

## Contexto
Eliminar la estética "plantilla SaaS" y adoptar un diseño con autoridad, asimétrico y tipografía robusta para un entorno B2B (Ponytail + Frontend Design rules activas).

## Fases del Proyecto

### Fase 1: Tipografía (Actual)
Reemplazar la tipografía actual por un stack técnico y de alta legibilidad, eliminando `DM Sans` y `Space Grotesk`.
- **Display (Títulos):** Bricolage Grotesque (o similar disponible en Google Fonts, ej. `Outfit` o `Syne`).
- **Body (Cuerpo):** Geist (o `Inter` con tracking ajustado si Geist no está disponible vía CDN/NPM rápido).
- **Mono (Métricas):** Geist Mono / JetBrains Mono.
- **Acción:** 
  1. Instalar dependencias o actualizar `<link>` en `index.html`.
  2. Actualizar `tailwind.config.js` (`fontFamily`).
  3. Reemplazar las clases globales necesarias en `index.css`.

### Fase 2: Layout y Bordes (Pendiente)
- Eliminar bordes redondeados (`rounded-xl` -> `rounded-none`).
- Ajustar sombras a un estilo más duro (neobrutalismo controlado).

### Fase 3: Paleta de Colores (Pendiente)
- Cambiar los colores base a tonos zinc/industriales (`bg-zinc-950`).
- Configurar el color de acento.

### Fase 4: Dashboard y Jerarquía (Pendiente)
- Extraer el estado de la suscripción a un indicador global fijo.
- Refactorizar `BillingSettings`.

---
## Detalle Fase 1 (Tipografía)

**Propuesta concreta (Ponytail: la ruta más corta):**
En lugar de lidiar con descargas manuales de fuentes, usaremos `@fontsource` vía npm que es lo más directo en Vite, o directamente el CDN de Google Fonts en `index.html`. 
- **Outfit** para Display (robusta, geométrica).
- **Inter** (configurada mecánicamente, ej. `tracking-tight`) para texto general (es la más legible para tablas de datos y ya tiene buen soporte).
- **JetBrains Mono** para datos numéricos.

**Archivos a tocar:**
- `index.html` (para agregar el CDN de Google Fonts).
- `tailwind.config.js` (para mapear `display`, `sans`, `mono`).
- `src/index.css` (para asignar la fuente por defecto al body).

## ¿Aprobación?
Revise esta Fase 1. Si está de acuerdo, procederé a aplicarla y actualizaré el contexto de Spec Kit.
