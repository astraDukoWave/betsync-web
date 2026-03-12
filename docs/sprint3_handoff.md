# BetSync Web — Sprint 3 HandOff

**Fecha:** 12 de marzo de 2026 | **Status:** Sprint 3 completo

---

## Resumen del Sprint 3

Este sprint consolida la producción del frontend: hardening de seguridad, alineación de tipos e interfaces con el backend FastAPI real, corrección de todas las rutas de API, y finalización del componente DashboardSummary con KPI cards funcionales.

---

## Entregables completados

### 1. Seguridad y Configuración

| Archivo | Descripción |
|---|---|
| `.gitignore` | Agrega `!.env.example` para permitir tracking del archivo de ejemplo |
| `.cursorrules` | Reglas de Cursor restauradas para el proyecto |
| `lib/api.ts` | Validación de URLs, cabeceras de seguridad, validación de odds |

### 2. Alineación con Backend Real

| Archivo | Descripción |
|---|---|
| `lib/types.ts` | Reescritura completa de interfaces para coincidir con campos reales del backend FastAPI |
| `lib/api.ts` | Corrección de todas las rutas: `/dashboard/summary`, `/picks/result`, `/pipeline/suggestions`, `/sportsbooks`, `/config` |
| `lib/queries.ts` | Hooks alineados con exports reales de `api.ts`, aliases backward-compatible |

### 3. Correcciones de Dashboard

| Archivo | Descripción |
|---|---|
| `components/dashboard/DashboardSummary.tsx` | Grid de 6 KPI cards: Hit Rate, ROI, P&L, Avg Odds, Avg CLV, Streak |
| `app/dashboard/page.tsx` | Cálculo de units client-side, supresión de warning de hidratación |

### 4. Correcciones de Settings

| Archivo | Descripción |
|---|---|
| `app/settings/page.tsx` | Reescritura para usar `useSportsbooks` + `useConfig` en lugar de `useSettings` |
| `lib/queries.ts` | Alias `useToggleSportsbook` para compatibilidad con `SportsbookCard` |

### 5. Correcciones de Tipos

| Archivo | Descripción |
|---|---|
| `lib/types.ts` | Aliases: `DashboardSummary`, `DashboardSegments`, `PipelineSuggestion`, `ConfigEntry` |

---

## Reglas .cursorrules aplicadas

- ✅ Colores semánticos: verde=ganancia, rojo=pérdida, azul=pendiente
- ✅ TanStack Query en todas las páginas (sin useEffect para datos)
- ✅ Validación de inputs en el servidor (URL, odds range)
- ✅ Cabeceras de seguridad HTTP
- ✅ Tipos alineados con backend real
- ✅ Manejo robusto de valores null/undefined en métricas

---

## Sprint 4 — Próximos pasos

- [ ] Autenticación JWT o NextAuth.js
- [ ] Tests E2E con Playwright
- [ ] Despliegue en Vercel
- [ ] Toast notifications (crear/resolver pick)
- [ ] Toggle modo oscuro/claro
- [ ] Exportar picks a CSV/Excel
- [ ] Conectar `NEXT_PUBLIC_API_BASE_URL` desde `.env.local`

---

Sprint 3 completado el 12 de marzo de 2026
