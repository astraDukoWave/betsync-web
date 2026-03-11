# BetSync Web — Sprint 2 HandOff

**Fecha:** 11 de marzo de 2026 | **Status:** Sprint 2 completo

---

## Resumen del Sprint 2

Este sprint implementa todos los componentes, páginas, lógica de datos y utilitarios del frontend de BetSync. El proyecto está listo para conectarse al backend FastAPI en `localhost:8000/api/v1`.

---

## Entregables completados

### 1. Páginas (App Router)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Redirect → `/dashboard` |
| `/dashboard` | `app/dashboard/page.tsx` | SSR: KPI cards + SegmentsChart + recent picks |
| `/pipeline` | `app/pipeline/page.tsx` | CSR: PipelineButton multi-estado + RadarGrid con polling 2s |
| `/picks` | `app/picks/page.tsx` | CSR: PicksTable virtualizada + FilterChips + ParlayBuilder |
| `/settings` | `app/settings/page.tsx` | CSR: SportsbookCard toggle + AI config inline-edit |

### 2. Componentes de Layout

| Archivo | Descripción |
|---------|-------------|
| `components/layout/AppShell.tsx` | Shell con Sidebar |
| `components/layout/Sidebar.tsx` | Navegación lateral |

### 3. Componentes de Dashboard

| Archivo | Descripción |
|---------|-------------|
| `components/dashboard/KPICard.tsx` | Card de métrica individual |
| `components/dashboard/KPICardSkeleton.tsx` | Skeleton loader para KPI cards |
| `components/dashboard/DashboardSummary.tsx` | Grid de 8 KPI cards |
| `components/dashboard/SegmentsChart.tsx` | Bar chart Recharts por sport/bet_type/grade |

### 4. Componentes de Pipeline

| Archivo | Descripción |
|---------|-------------|
| `components/pipeline/PipelineButton.tsx` | Botón multi-estado: idle/running/done/error |
| `components/pipeline/RadarGrid.tsx` | Grid de RadarCards con swipe GPU |

### 5. Componentes de Picks

| Archivo | Descripción |
|---------|-------------|
| `components/picks/PicksTable.tsx` | Tabla virtualizada (@tanstack/react-virtual) |
| `components/picks/PickRow.tsx` | Fila expandible con detalles del pick |
| `components/picks/PickModal.tsx` | Modal Crear + Resolver pick |
| `components/picks/ParlayBuilder.tsx` | Constructor de parlays con cálculo de odds |
| `components/picks/FilterChips.tsx` | Chips de filtro genérico multi-select |

### 6. Componentes de Parlays

| Archivo | Descripción |
|---------|-------------|
| `components/parlays/ParlayCard.tsx` | Card expandible con legs del parlay |
| `components/parlays/ParlayModal.tsx` | Modal detalle de parlay |

### 7. Componentes de Settings

| Archivo | Descripción |
|---------|-------------|
| `components/settings/SportsbookCard.tsx` | Card de sportsbook con toggle on/off |
| `components/settings/ConfigRow.tsx` | Fila con inline-edit (Enter=save, Esc=cancel) |

### 8. Componentes Compartidos

| Archivo | Descripción |
|---------|-------------|
| `components/shared/StatusBadge.tsx` | Badge de estado: won/lost/pending/push/void |
| `components/shared/GradeBadge.tsx` | Badge de grade: A/B/C/D/F con colores |
| `components/shared/CLVBadge.tsx` | Badge de CLV: +X% verde / -X% rojo |
| `components/shared/OddsChip.tsx` | Chip de odds en JetBrains Mono |
| `components/shared/SkeletonCard.tsx` | Skeleton genérico |
| `components/shared/ErrorState.tsx` | Estado de error con retry |
| `components/shared/index.tsx` | Re-exports de todos los shared |

### 9. Librería (`lib/`)

| Archivo | Descripción |
|---------|-------------|
| `lib/types.ts` | Todos los tipos TypeScript de la API |
| `lib/api.ts` | Todas las llamadas HTTP a `/api/v1` |
| `lib/queries.ts` | TanStack Query hooks con staleTime y polling |
| `lib/formatters.ts` | formatOdds, formatROI, formatCLV, formatDate |
| `lib/utils.ts` | cn() helper para Tailwind |

### 10. Providers

| Archivo | Descripción |
|---------|-------------|
| `providers/QueryProvider.tsx` | TanStack QueryClient con defaults |

---

## Reglas .cursorrules aplicadas

- ✅ Colores semánticos: verde=ganancia, rojo=pérdida, azul=pendiente
- ✅ TanStack Query en todas las páginas (sin useEffect para datos)
- ✅ Animaciones GPU-only en RadarGrid (transform/opacity)
- ✅ Polling `refetchInterval: 2000` en pipeline
- ✅ Estado normalizado en queries
- ✅ Virtualización en PicksTable (@tanstack/react-virtual)
- ✅ Skeleton loaders en todas las vistas

---

## Sprint 3 — Próximos pasos

- [ ] Conectar backend FastAPI real (`.env.local` → `NEXT_PUBLIC_API_BASE_URL`)
- [ ] Agregar autenticación (JWT o NextAuth)
- [ ] Tests E2E con Playwright
- [ ] Despliegue en Vercel o Railway
- [ ] Toast notifications para acciones (crear/resolver pick)
- [ ] Modo oscuro/claro toggle
- [ ] Exportar picks a CSV/Excel

---

Sprint 2 completado el 11 de marzo de 2026
