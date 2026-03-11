# BetSync Web — Sprint 1 HandOff
**Fecha:** 10 de marzo de 2026 | **Status:** Sprint 1 completo

---

## Resumen del Sprint 1

Este sprint establece las bases del frontend: wireframes visuales generados en Stitch, repo creado, reglas de Cursor configuradas, y la arquitectura de archivos definida.

---

## Entregables completados

### 1. Google Stitch — 4 pantallas generadas
Proyecto en: https://stitch.withgoogle.com/projects/6505458543800443509

| Pantalla | Descripción | Estado |
|----------|------------|--------|
| Panel de Control (Dashboard) | KPI cards, gráfica de segmentos, últimos picks/parlays | ✅ Generado |
| Radar de Oportunidades (Pipeline) | Botón multi-estado, cards swipe con Grade, toast 409 | ✅ Generado |
| Libreta de Apuestas (Picks & Parlays) | Tabla expandible, CLV badges, Parlay Builder | ✅ Generado |
| Configuración (Settings) | Sportsbook cards, Motor IA inline-edit | ✅ Generado |

### 2. Repositorio
- **Repo:** https://github.com/astraDukoWave/betsync-web
- **Stack:** Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui
- **Archivos iniciales:** `.cursorrules`, `.gitignore` (Node), `README.md`

### 3. `.cursorrules` — 7 reglas para Cursor Pro

| # | Regla | Propósito |
|---|-------|----------|
| 1 | Colores semánticos estrictos | Nunca rojo=éxito ni verde=pérdida |
| 2 | TanStack Query (sin useEffect) | Skeleton loaders obligatorios |
| 3 | Animaciones GPU-only | `transform` nunca `margin-left` |
| 4 | Observer APIs | IntersectionObserver + ResizeObserver |
| 5 | Estado normalizado | Diccionario O(1) para picks |
| 6 | Polling del pipeline | `refetchInterval: 2000`, timeout 60s |
| 7 | Virtualización | @tanstack/react-virtual para 100+ rows |

---

## Arquitectura de archivos (Next.js 14 App Router)

```
betsync-web/
├── .cursorrules                    # Reglas para Cursor Pro
├── .env.local                      # Variables de entorno
├── .env.example                    # Plantilla de env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── app/
│   ├── layout.tsx                  # QueryProvider + ThemeProvider
│   ├── page.tsx                    # Redirect → /dashboard
│   ├── dashboard/
│   │   └── page.tsx                # SSR: summary + segments
│   ├── pipeline/
│   │   └── page.tsx                # CSR: polling job_id
│   ├── picks/
│   │   └── page.tsx                # CSR + virtualización
│   └── settings/
│       └── page.tsx                # CSR: inline editing
├── components/
│   ├── ui/                         # shadcn/ui base (button, card, badge, etc.)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── AppShell.tsx
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── KPICardSkeleton.tsx
│   │   ├── SegmentsChart.tsx
│   │   └── DashboardSummary.tsx
│   ├── pipeline/
│   │   ├── PipelineButton.tsx      # 3 estados: idle/running/done
│   │   ├── RadarCard.tsx           # GPU swipe animation
│   │   └── RadarGrid.tsx
│   ├── picks/
│   │   ├── PickRow.tsx             # Expandible
│   │   ├── PicksTable.tsx          # Virtualizada
│   │   ├── PickModal.tsx           # Crear/Resolver pick
│   │   ├── ParlayBuilder.tsx
│   │   └── FilterChips.tsx
│   ├── parlays/
│   │   ├── ParlayCard.tsx
│   │   └── ParlayModal.tsx
│   ├── settings/
│   │   ├── SportsbookCard.tsx
│   │   └── ConfigRow.tsx           # Inline edit
│   └── shared/
│       ├── StatusBadge.tsx         # won/lost/pending/push/void
│       ├── GradeBadge.tsx          # A/B/C con colores
│       ├── CLVBadge.tsx            # +X% verde / -X% rojo
│       ├── OddsChip.tsx            # JetBrains Mono
│       ├── SkeletonCard.tsx
│       └── ErrorState.tsx
├── lib/
│   ├── api.ts                      # Todas las llamadas a /api/v1
│   ├── queries.ts                  # TanStack Query hooks
│   ├── formatters.ts               # formatOdds, formatROI, formatCLV
│   └── types.ts                    # Tipos TypeScript de la API
└── docs/
    ├── sprint1_handoff.md          # Este archivo
    └── stitch_project_url.txt      # Link al proyecto de Stitch
```

---

## Tokens de diseño (Tailwind + CSS variables)

```css
/* globals.css */
:root {
  --background: #0F1117;
  --surface: #1A1D27;
  --surface-elevated: #232738;
  --font-mono: 'JetBrains Mono', monospace;
}
```

```typescript
// tailwind.config.ts extend
colors: {
  background: '#0F1117',
  surface: '#1A1D27',
  'surface-elevated': '#232738',
}
```

---

## Variables de entorno (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_POLLING_INTERVAL_MS=2000
NEXT_PUBLIC_PIPELINE_TIMEOUT_MS=60000
```

---

## Comandos de inicio (Sprint 2)

```bash
# 1. Clonar repo
git clone https://github.com/astraDukoWave/betsync-web
cd betsync-web

# 2. Crear proyecto Next.js 14
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no

# 3. Instalar dependencias
npm install @tanstack/react-query @tanstack/react-virtual
npm install recharts
npm install lucide-react
npm install clsx tailwind-merge class-variance-authority
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-tooltip

# 4. Instalar shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card badge input label tabs dialog toast skeleton

# 5. Configurar JetBrains Mono (Google Fonts)
# Agregar en layout.tsx: import { JetBrains_Mono, Inter } from 'next/font/google'

# 6. Conectar API del backend
cp .env.example .env.local
# Editar NEXT_PUBLIC_API_BASE_URL
```

---

## Flujo de trabajo Stitch → Figma MCP → Cursor

```
[Google Stitch] → genera HTML/JSX base con layout visual
        ↓
[Figma via MCP] → design tokens + componentes formales
        ↓
[Cursor Pro + .cursorrules] → genera código Next.js exacto
        ↓
[shadcn/ui + Tailwind] → componentes accesibles y production-ready
        ↓
[API BetSync] → FastAPI en localhost:8000/api/v1
```

---

## Sprint 2 — Próximos pasos

- [ ] Inicializar proyecto Next.js 14 con `create-next-app`
- [ ] Configurar Tailwind con tokens de diseño personalizados
- [ ] Instalar shadcn/ui y dependencias
- [ ] Crear `lib/types.ts` con todos los tipos del HandOff
- [ ] Crear `lib/api.ts` con todas las llamadas a la API
- [ ] Crear `lib/queries.ts` con hooks de TanStack Query
- [ ] Implementar componente `AppShell` + `Sidebar`
- [ ] Implementar Dashboard con KPI cards + skeleton
- [ ] Implementar Radar con polling y swipe cards
- [ ] Implementar Libreta con tabla virtualizada
- [ ] Implementar Settings con inline edit

---
*Sprint 1 completado el 10 de marzo de 2026*
