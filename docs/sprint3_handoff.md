# BetSync Web — Sprint 3 HandOff

**Fecha:** 12 de marzo de 2026 | **Status:** Sprint 3 completo

---

## Resumen del Sprint 3

Este sprint consolida la producción del frontend: hardening de seguridad, alineación de tipos e interfaces con el backend FastAPI real, corrección de todas las rutas de API, finalización del componente DashboardSummary con KPI cards funcionales, y una ronda completa de fixes de integración para que las páginas `/picks` y `/settings` funcionen correctamente con datos reales.

---

## Entregables completados

### 1. Seguridad y Configuración

| Archivo | Descripción | Commit |
|---|---|---|
| `.gitignore` | Agrega `!.env.example` para permitir tracking del archivo de ejemplo | `018eba7` |
| `.cursorrules` | Reglas de Cursor restauradas para el proyecto | `018eba7` |
| `lib/api.ts` | Validación de URLs, cabeceras de seguridad, validación de odds | `54d3dbd` |
| `next.config.ts` | Agrega `https://*.app.github.dev` al CSP `connect-src` para GitHub Codespaces | `150efe1` |

### 2. Alineación con Backend Real

| Archivo | Descripción | Commit |
|---|---|---|
| `lib/types.ts` | Reescritura completa de interfaces para coincidir con campos reales del backend FastAPI | `b509f19` |
| `lib/types.ts` | Aliases: `DashboardSummary`, `DashboardSegments`, `PipelineSuggestion`, `ConfigEntry` | `3e7be15` |
| `lib/api.ts` | Corrección de todas las rutas: `/dashboard/summary`, `/picks/result`, `/pipeline/suggestions`, `/sportsbooks`, `/config` | `362736f` |
| `lib/queries.ts` | Hooks alineados con exports reales de `api.ts`, aliases backward-compatible | `ce879de` |
| `lib/queries.ts` | Alias `useToggleSportsbook` para compatibilidad con `SportsbookCard` | `31a01a5` |

### 3. Correcciones de Dashboard

| Archivo | Descripción | Commit |
|---|---|---|
| `components/dashboard/DashboardSummary.tsx` | Grid de 6 KPI cards: Hit Rate, ROI, P&L, Avg Odds, Avg CLV, Streak. Usa campos reales del backend (`hit_rate`, `roi`, `total_return`, `total_stake`, `avg_odds_decimal`, `avg_clv`, `current_streak`) | `276c020` |
| `app/dashboard/page.tsx` | Cálculo de units client-side, supresión de warning de hidratación | `c600b4b` |

### 4. Correcciones de Picks

| Archivo | Descripción | Commit |
|---|---|---|
| `components/picks/PicksTable.tsx` | `key={pick.id}` → `key={pick.pick_id}` (fix React unique key crash). Columnas actualizadas: `run_date`, `odds_american`, `selection en market`, `source`. `colSpan` 7→8. `<thead>` a 8 columnas | `b1be7a4` |
| `components/picks/PickRow.tsx` | `pick.away_team @ pick.home_team` → `pick.selection en pick.market`. `pick.sport` → `pick.source`. `pick.game_date` → `pick.run_date`. `pick.odds` → `pick.odds_american`. Eliminadas propiedades inexistentes: `bet_type`, `result_margin`, `notes` | `b1be7a4` |

### 5. Correcciones de Settings

| Archivo | Descripción | Commit |
|---|---|---|
| `app/settings/page.tsx` | `key={sb.id}` → `key={sb.sportsbook_id}` (fix React unique key crash en lista de sportsbooks) | `1035605` |
| `components/settings/SportsbookCard.tsx` | `sportsbook.id` → `sportsbook.sportsbook_id` en la llamada a la mutación PATCH | `1035605` |
| `app/settings/page.tsx` | Sección Motor IA reescrita: reemplaza `<div>` estáticos por componentes `<ConfigRow>` editables. Constante `AI_CONFIG_ENTRIES` como fuente única de verdad para las claves del backend (`ai_model`, `min_grade`, `min_edge_pct`, `max_picks_per_day`, `unit_size_usd`). Eliminado objeto intermedio `aiConfig` roto | `4f1b2de` |

### 6. Correcciones de Formateadores

| Archivo | Descripción | Commit |
|---|---|---|
| `lib/formatters.ts` | `safeNum` ahora hace coerción explícita con `Number(v)` antes de cualquier `.toFixed()`. Protege `formatOdds`, `formatROI`, `formatCLV`, `formatWinRate`, `formatUnits`, `formatStreak` contra el envío de `Decimal` como `string` por parte del backend Python/FastAPI | `497de5f` |

---

## Estado de páginas al cierre del Sprint 3

| Página | Estado | Notas |
|---|---|---|
| `/dashboard` | ✅ Funcional | Muestra datos reales del backend |
| `/picks` | ✅ Funcional | Tabla renderiza con datos reales |
| `/pipeline` | ✅ Funcional | Sin oportunidades (requiere API externa) |
| `/settings` Sportsbooks | ✅ Funcional | Toggles on/off funcionan correctamente |
| `/settings` Motor IA | ⏳ En espera | Código listo, requiere seed de la tabla `config` en la DB |

---

## Reglas .cursorrules aplicadas

- ✅ Colores semánticos: verde=ganancia, rojo=pérdida, azul=pendiente
- ✅ TanStack Query en todas las páginas (sin useEffect para datos)
- ✅ Validación de inputs en el servidor (URL, odds range)
- ✅ Cabeceras de seguridad HTTP
- ✅ Tipos alineados con backend real
- ✅ Manejo robusto de valores null/undefined en métricas
- ✅ Protección contra Decimal-as-string de Python en todos los formateadores

---

## Sprint 4 — Próximos pasos

- [ ] Autenticación JWT o NextAuth.js
- [ ] Tests E2E con Playwright
- [ ] Despliegue en Vercel
- [ ] Toast notifications (crear/resolver pick)
- [ ] Toggle modo oscuro/claro
- [ ] Exportar picks a CSV/Excel
- [ ] Seed de tabla `config` en el backend (desbloquea Motor IA en Settings)
- [ ] Conectar `NEXT_PUBLIC_API_BASE_URL` desde `.env.local`

---

Sprint 3 completado el 12 de marzo de 2026
