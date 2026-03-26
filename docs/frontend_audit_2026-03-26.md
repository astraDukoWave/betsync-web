# Auditoría Frontend BetSync (Next.js/React)

**Fecha:** 2026-03-26  
**Rol de evaluación:** Principal Frontend Architect (fintech/ledger dashboards)

## Veredicto Ejecutivo

**Clasificación: B) Parcialmente reusable.**

El frontend actual **sí es aprovechable** como shell visual (layout, navegación, componentes UI base, integración React Query), pero **no está modelado para un dominio contable real** (ledger/reconciliation/fiscal layer completo). Además, coexisten señales de deuda técnica severa (tipos desalineados y componentes que aún referencian contratos viejos), lo que impide considerarlo production-grade para una plataforma financiera audit-able.

---

## 1) Arquitectura frontend

### Lo rescatable
- Estructura por áreas (`app/`, `components/`, `lib/`, `providers/`) clara para un producto dashboard.  
- Data fetching centralizado en `lib/api.ts` + hooks en `lib/queries.ts` con TanStack Query (buen baseline de escalabilidad en lectura remota).  
- `QueryProvider` único con defaults de cache/retry bien definidos.

### Problemas de arquitectura
- **No existe capa de dominio financiero** (ej. `domain/ledger`, `domain/reconciliation`, `domain/balances`) separada de UI/data mapping; todo está acoplado a tipos API y presentación.
- **Inconsistencia de contratos internos**: parte del código usa modelo nuevo (`pick_id`, `odds_american`), mientras otra parte mantiene modelo legacy (`id`, `odds`, `away_team/home_team`).
- Escalabilidad limitada para contexto financiero porque no hay:
  - versionado de contratos,
  - normalización por entidades,
  - estrategia explícita de precisión monetaria (decimales/rounding determinístico).

---

## 2) Integración con backend

### Estado actual
- Consume endpoints reales vía `fetch` contra `NEXT_PUBLIC_API_BASE_URL` con fallback local (`http://localhost:8000/api/v1`).
- Hay endpoints de dashboard, picks, parlays, pipeline, sportsbooks, config y fiscal summary.

### Brecha con backend financiero real
- No aparecen endpoints ni tipos para:
  - **ledger entries** transaccionales,
  - **balances desglosados** (`available_balance`, `locked_balance`, `exposure`),
  - **reconciliation runs** (estado, diferencias, excepciones, aprobaciones),
  - **trail de auditoría**.
- La UI fiscal es de resumen agregado; no hay drill-down de asientos, conciliación o evidencia documental.

**Conclusión:** integración real sí existe, pero el dominio conectado sigue siendo principalmente “bet analytics + tax snapshot”, no un frontend financiero-contable completo.

---

## 3) Modelado UI vs dominio

### Qué sí refleja
- KPIs de performance de apuestas (hit rate, ROI, P&L, CLV).
- Flujo básico fiscal (resumen anual + descarga CSV).

### Qué no refleja (crítico)
- No existe representación de:
  - `available_balance` vs `locked_balance`,
  - libro mayor (ledger entries con debit/credit/counterparty/reference),
  - estados de conciliación (`matched`, `unmatched`, `needs_review`, `posted`),
  - periodos contables/cierre, ni estado de fiscalización.

### Diagnóstico de producto
Hoy el producto se comporta más como **“bet tracker con widgets de performance”** que como **“financial operations console”**.

---

## 4) Riesgos críticos

1. **Riesgo de inconsistencia de datos en runtime** por mezcla de contratos nuevos y legacy en componentes.
2. **Riesgo de decisiones financieras erróneas**: la UI presenta métricas agregadas sin exponer reconciliación ni trazabilidad.
3. **Riesgo de compliance/auditoría**: ausencia de vistas de evidencias contables y flujo de aprobaciones.
4. **Riesgo de percepción de completitud falsa**: dashboard “bonito” puede ocultar ausencia de capa contable real.

---

## 5) Gap Analysis (EXACTA)

### Qué está roto
1. `components/picks/PickModal.tsx` usa campos que no existen en el tipo `Pick` actual (`id`, `away_team`, `home_team`, etc.) y múltiples `any`.
2. `components/picks/ParlayBuilder.tsx` usa `pick.id`, `pick.odds`, `pick.away_team/home_team` y payload de creación desalineado (`name`) vs `ParlayCreate` actual.
3. `components/parlays/ParlayCard.tsx` usa `parlay.id`, `parlay.odds`, `parlay.legs`, `parlay.name/payout` no presentes en el contrato vigente.
4. `components/parlays/ParlayModal.tsx` repite la misma desalineación de contrato legacy.
5. `components/dashboard/SegmentsChart.tsx` y `components/picks/PickModal.tsx` rompen lint por `any`, dejando CI no verde.

### Qué está desactualizado
1. `docs/sprint2_handoff.md` describe capacidades (virtualización en picks, SSR dashboard con segments) que no coinciden totalmente con el estado visible actual.
2. El dominio tipado en `lib/types.ts` aún está orientado a apuestas y no a ledger/reconciliation.
3. Formatos de stake/unidades (`u`) conviven con montos monetarios sin política única de unidad contable.

### Qué falta para demo profesional (financiera)
1. Módulo de balances con `available/locked/pending` y exposición por sportsbook/currency.
2. Vista de ledger con filtros, detalle transaccional, contra-asiento y referencias externas.
3. Módulo de reconciliación (runs, diferencias, aging, resolución manual con motivo).
4. Trazabilidad de cambios (audit log UI).
5. Manejo robusto de money precision (decimal exacto, formato por divisa, rounding policy).
6. Estados de error de negocio (no solo fetch error): desbalance, transacción huérfana, rate mismatch, asiento duplicado.
7. Contratos frontend-backend versionados y testeados (contract tests).
8. KPIs financieros reales: cash-in/out, liability, realized/unrealized P&L, settlement latency.

---

## 6) Recomendación FINAL

## **B) Parcialmente reusable**

### Qué reutilizar
- Shell de navegación, sistema visual, componentes base (`ui/*`), infraestructura React Query, patrón general de páginas.

### Qué reconstruir parcialmente (obligatorio)
- Capa de dominio financiero (modelos, mappers, invariantes).
- Módulos funcionales ledger/reconciliation/balances.
- Componentes legacy desalineados con contratos actuales.
- Observabilidad de datos y auditoría en UI.

No recomiendo “A) salvable con refactor menor”, porque la brecha no es cosmética: es de **modelo de dominio**.

---

## Plan de acción priorizado (máx 10)

1. **Congelar features UI nuevas** y cerrar deuda de contratos rotos/legacy en picks-parlays.
2. Definir **Financial Domain Contract v1** (balances, ledger entry, reconciliation case, fiscal record).
3. Implementar capa `domain/` + mappers `api -> domain` (sin mezclar shape API en componentes).
4. Crear página `Balances` con disponible/bloqueado/exposición y drilldown.
5. Crear página `Ledger` con tabla auditable, filtros y export.
6. Crear página `Reconciliation` con estado por corrida, diff buckets y workflow de resolución.
7. Introducir librería/estrategia de **precision decimal** para montos y cálculos.
8. Añadir contract tests (tipos + runtime validation) y smoke E2E de rutas críticas.
9. Estandarizar copy/UX para “riesgo financiero” (disclaimers, estados operativos, severidades).
10. Reescribir docs de handoff a estado real y roadmap de migración por fases.

---

## Qué NO tocar (importante)

1. **No rehacer** el sistema de diseño base (shadcn + Tailwind) ahora: no es el cuello de botella.
2. **No migrar** de framework (Next/React) en esta etapa.
3. **No introducir** estado global complejo adicional hasta cerrar modelo de dominio y contratos.
4. **No optimizar micro-performance** antes de estabilizar exactitud financiera y consistencia de datos.

---

## Dictamen brutalmente honesto

El frontend está bien encaminado para un producto de analítica de apuestas, pero **aún no representa un sistema contable-financiero real**. Si BetSync quiere demo profesional frente a stakeholders financieros/regulatorios, necesita una fase de reconstrucción parcial centrada en dominio (no en cosmética).
