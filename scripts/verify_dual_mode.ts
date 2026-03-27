/**
 * Game Day 6.3 — Certificación del modo dual (financialApi resiliencia).
 *
 * Cada escenario corre en un subproceso: `lib/financialApi.ts` captura env al importar,
 * así que no basta con mutar process.env en el mismo proceso.
 *
 * Uso: `npm run verify:dual-mode` o `node --import tsx scripts/verify_dual_mode.ts`
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SCRIPT_ABS = path.resolve(__dirname, "verify_dual_mode.ts");

const CODESPACES_BASE =
  "https://congenial-spoon-wr59jvgq9j74fq9g-8000.app.github.dev/api/v1";
const FAKE_BASE = "https://url-falsa-que-no-existe.dev/api/v1";
const SECRET = "supersecret_gameday6";

const MOCK_AVAILABLE = 12350.42;
/** Referencia documentada en Game Day (ejemplo); el seed real en BD puede diferir. */
const REAL_BALANCE_REFERENCE_EXAMPLE = 15340.5;

const scenarioArg = process.argv[2];

function spawnScenario(
  id: number,
  extraEnv: Record<string, string>
): { ok: boolean; output: string } {
  const r = spawnSync(
    process.execPath,
    ["--import", "tsx", SCRIPT_ABS, String(id)],
    {
      cwd: PROJECT_ROOT,
      env: { ...process.env, ...extraEnv },
      encoding: "utf-8",
    }
  );
  const output = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  return { ok: r.status === 0, output };
}

async function runChildScenario(id: number): Promise<void> {
  const { getBalances } = await import("../lib/financialApi");

  if (id === 1) {
    const b = await getBalances();
    if (Math.abs(b.available_balance - MOCK_AVAILABLE) > 0.01) {
      throw new Error(
        `Escenario 1: se esperaba available_balance mock ${MOCK_AVAILABLE}, obtuvo ${b.available_balance}`
      );
    }
    console.log(
      `PASS [1] Mocks ON — available_balance=${b.available_balance} (MOCK_FINANCIAL_DASHBOARD_FALLBACK)`
    );
    return;
  }

  if (id === 2) {
    const b = await getBalances();
    if (Math.abs(b.available_balance - MOCK_AVAILABLE) < 0.01) {
      throw new Error(
        "Escenario 2: se esperaban datos reales del API; se recibió el saldo mock (12350.42)."
      );
    }
    if (!Number.isFinite(b.available_balance) || b.available_balance < 0) {
      throw new Error(
        `Escenario 2: saldo inválido del API: ${b.available_balance}`
      );
    }
    const nearDocExample =
      Math.abs(b.available_balance - REAL_BALANCE_REFERENCE_EXAMPLE) < 500;
    console.log(
      `PASS [2] Mocks OFF + backend — available_balance=${b.available_balance} (referencia doc ~${REAL_BALANCE_REFERENCE_EXAMPLE}${nearDocExample ? ", alineado" : ", seed distinto al ejemplo; OK"})`
    );
    return;
  }

  if (id === 3) {
    let sawResilienceWarn = false;
    const orig = console.warn;
    console.warn = (...args: unknown[]) => {
      const text = args
        .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
      if (text.includes("[financialApi]") && text.includes("mock fallback")) {
        sawResilienceWarn = true;
      }
      orig.apply(console, args as Parameters<typeof console.warn>);
    };
    try {
      const b = await getBalances();
      if (Math.abs(b.available_balance - MOCK_AVAILABLE) > 0.01) {
        throw new Error(
          `Escenario 3: tras fallo de red se esperaba fallback ${MOCK_AVAILABLE}, obtuvo ${b.available_balance}`
        );
      }
      if (!sawResilienceWarn) {
        throw new Error(
          'Escenario 3: no se observó console.warn de resiliencia ("[financialApi]" + "mock fallback").'
        );
      }
      console.log(
        `PASS [3] Caos — URL rota; fallback silencioso; available_balance=${b.available_balance}`
      );
    } finally {
      console.warn = orig;
    }
    return;
  }

  throw new Error(`Escenario desconocido: ${id}`);
}

async function main(): Promise<void> {
  if (!scenarioArg) {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  Reporte de Certificación — Game Day 6.3 (Modo dual)");
    console.log("═══════════════════════════════════════════════════════════\n");

    const rows: Array<{
      id: number;
      name: string;
      ok: boolean;
      output: string;
    }> = [];

    const scenarios: Array<{ id: number; name: string; env: Record<string, string> }> = [
      {
        id: 1,
        name: "Escenario 1 — Mocks ON",
        env: {
          NEXT_PUBLIC_USE_FINANCIAL_MOCKS: "true",
          NEXT_PUBLIC_API_BASE_URL: CODESPACES_BASE,
          NEXT_PUBLIC_RECONCILIATION_SECRET: SECRET,
        },
      },
      {
        id: 2,
        name: "Escenario 2 — Mocks OFF + backend Codespaces",
        env: {
          NEXT_PUBLIC_USE_FINANCIAL_MOCKS: "false",
          NEXT_PUBLIC_API_BASE_URL: CODESPACES_BASE,
          NEXT_PUBLIC_RECONCILIATION_SECRET: SECRET,
        },
      },
      {
        id: 3,
        name: "Escenario 3 — Caos (URL inválida, fallback automático)",
        env: {
          NEXT_PUBLIC_USE_FINANCIAL_MOCKS: "false",
          NEXT_PUBLIC_API_BASE_URL: FAKE_BASE,
          NEXT_PUBLIC_RECONCILIATION_SECRET: SECRET,
        },
      },
    ];

    for (const s of scenarios) {
      console.log(`▶ ${s.name}`);
      const { ok, output } = spawnScenario(s.id, s.env);
      if (output) console.log(output);
      console.log(ok ? "  Estado: PASS\n" : "  Estado: FAIL\n");
      rows.push({ id: s.id, name: s.name, ok, output });
    }

    const allOk = rows.every((r) => r.ok);

    console.log("───────────────────────────────────────────────────────────");
    console.log("  Resumen");
    console.log("───────────────────────────────────────────────────────────");
    for (const r of rows) {
      console.log(`  ${r.ok ? "✓" : "✗"} ${r.name}`);
    }
    console.log("");
    console.log(
      allOk
        ? "RESULTADO FINAL: CERTIFICADO — Resiliencia y conexión al backend validadas."
        : "RESULTADO FINAL: NO CERTIFICADO — Revisar salidas de escenarios fallidos."
    );
    console.log("═══════════════════════════════════════════════════════════\n");

    process.exit(allOk ? 0 : 1);
    return;
  }

  const id = Number(scenarioArg);
  if (!Number.isFinite(id) || id < 1 || id > 3) {
    console.error("Uso hijo: verify_dual_mode.ts <1|2|3>");
    process.exit(1);
  }
  await runChildScenario(id);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
