import { groups } from './groups';
import type { StaticMatch } from './fixtures-static';
import type { LiveScore } from './live';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GroupRow {
  teamCode: string;
  group: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

// ── FIFA 2026: qué grupos pueden ir a cada slot de mejor-3ro ───────────────────
// Clave = código de slot en fixtures-static; valor = grupos elegibles para ese slot

const THIRD_SLOT_ELIGIBLE: Record<string, string[]> = {
  '3ABCDF': ['A', 'B', 'C', 'D', 'F'],
  '3CDFGH': ['C', 'D', 'F', 'G', 'H'],
  '3CEFHI': ['C', 'E', 'F', 'H', 'I'],
  '3EHIJK': ['E', 'H', 'I', 'J', 'K'],
  '3AEHIJ': ['A', 'E', 'H', 'I', 'J'],
  '3BEFIJ': ['B', 'E', 'F', 'I', 'J'],
  '3EFGIJ': ['E', 'F', 'G', 'I', 'J'],
  '3DEIJL': ['D', 'E', 'I', 'J', 'L'],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function isFinished(m: StaticMatch, liveScores: Map<number, LiveScore>): boolean {
  return liveScores.get(m.id)?.status === 'FINISHED' || m.status === 'finished';
}

function getScore(m: StaticMatch, liveScores: Map<number, LiveScore>): [number, number] | null {
  const live = liveScores.get(m.id);
  const h = live?.homeScore ?? m.homeScore;
  const a = live?.awayScore ?? m.awayScore;
  return h !== null && a !== null ? [h, a] : null;
}

// ── Standings ──────────────────────────────────────────────────────────────────

export function computeGroupTable(
  groupName: string,
  allMatches: StaticMatch[],
  liveScores: Map<number, LiveScore>,
): GroupRow[] {
  const groupDef = groups.find(g => g.name === groupName);
  if (!groupDef) return [];

  const groupMatches = allMatches.filter(m => m.group === groupName);
  const table = new Map<string, GroupRow>();

  for (const code of groupDef.teams) {
    table.set(code, { teamCode: code, group: groupName, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
  }

  for (const m of groupMatches) {
    if (!isFinished(m, liveScores)) continue;
    const sc = getScore(m, liveScores);
    if (!sc) continue;
    const [hs, as] = sc;

    const home = table.get(m.homeTeamCode);
    const away = table.get(m.awayTeamCode);
    if (!home || !away) continue;

    home.pj++; away.pj++;
    home.gf += hs; home.gc += as;
    away.gf += as; away.gc += hs;

    if (hs > as) { home.pg++; home.pts += 3; away.pp++; }
    else if (as > hs) { away.pg++; away.pts += 3; home.pp++; }
    else { home.pe++; home.pts++; away.pe++; away.pts++; }
  }

  const rows = Array.from(table.values()).map(r => ({ ...r, dg: r.gf - r.gc }));

  // Sort: pts → dg → gf → H2H pts → H2H dg → H2H gf → code
  rows.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg)  return b.dg - a.dg;
    if (b.gf !== a.gf)  return b.gf - a.gf;

    // H2H directo entre este par
    let aPts = 0, bPts = 0, aDg = 0, bDg = 0, aGf = 0, bGf = 0;
    for (const m of groupMatches) {
      const isH2H =
        (m.homeTeamCode === a.teamCode && m.awayTeamCode === b.teamCode) ||
        (m.homeTeamCode === b.teamCode && m.awayTeamCode === a.teamCode);
      if (!isH2H) continue;
      const sc = getScore(m, liveScores);
      if (!sc) continue;
      const [hs, as2] = sc;
      if (m.homeTeamCode === a.teamCode) {
        aGf += hs; bGf += as2; aDg += hs - as2; bDg += as2 - hs;
        if (hs > as2) aPts += 3; else if (as2 > hs) bPts += 3; else { aPts++; bPts++; }
      } else {
        bGf += hs; aGf += as2; bDg += hs - as2; aDg += as2 - hs;
        if (hs > as2) bPts += 3; else if (as2 > hs) aPts += 3; else { aPts++; bPts++; }
      }
    }
    if (bPts !== aPts) return bPts - aPts;
    if (bDg !== aDg)   return bDg - aDg;
    if (bGf !== aGf)   return bGf - aGf;

    return a.teamCode.localeCompare(b.teamCode);
  });

  return rows;
}

function isGroupComplete(groupName: string, allMatches: StaticMatch[], liveScores: Map<number, LiveScore>): boolean {
  const gm = allMatches.filter(m => m.group === groupName);
  return gm.length > 0 && gm.every(m => isFinished(m, liveScores));
}

// ── Mejor 3ro ──────────────────────────────────────────────────────────────────

function rankThirdPlaceTeams(
  allTables: Map<string, GroupRow[]>,
  completeGroups: string[],
): GroupRow[] {
  const thirds: GroupRow[] = [];
  for (const g of completeGroups) {
    const row = allTables.get(g)?.[2];
    if (row) thirds.push(row);
  }
  // Criterio FIFA entre terceros: pts → dg → gf → code
  thirds.sort((a, b) =>
    b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.teamCode.localeCompare(b.teamCode)
  );
  return thirds.slice(0, 8);
}

// ── Asignación de slots de mejor-3ro (backtracking) ───────────────────────────
// Dado cuáles 8 grupos avanzan como 3ro, devuelve Map<slotCode → groupLetter>

function assignThirdSlots(advancingGroups: string[]): Map<string, string> {
  const slotKeys = Object.keys(THIRD_SLOT_ELIGIBLE);
  const result   = new Map<string, string>();

  function bt(i: number, used: Set<string>): boolean {
    if (i === slotKeys.length) return true;
    const slot = slotKeys[i];
    for (const g of THIRD_SLOT_ELIGIBLE[slot]) {
      if (!advancingGroups.includes(g) || used.has(g)) continue;
      result.set(slot, g);
      used.add(g);
      if (bt(i + 1, used)) return true;
      result.delete(slot);
      used.delete(g);
    }
    return false;
  }

  bt(0, new Set());
  return result;
}

// ── Función principal ──────────────────────────────────────────────────────────
// Devuelve Map<placeholderCode → teamCode> para todos los slots que ya están resueltos

export function resolveBracketCodes(
  allMatches: StaticMatch[],
  liveScores: Map<number, LiveScore>,
): Map<string, string> {
  const resolved = new Map<string, string>();
  const allTables = new Map<string, GroupRow[]>();
  const completeGroups: string[] = [];

  for (const g of groups) {
    const table = computeGroupTable(g.name, allMatches, liveScores);
    allTables.set(g.name, table);
    if (isGroupComplete(g.name, allMatches, liveScores)) {
      completeGroups.push(g.name);
    }
  }

  // Resolver 1ro y 2do de grupos completos
  for (const gName of completeGroups) {
    const rows = allTables.get(gName)!;
    if (rows[0]) resolved.set(`1${gName}`, rows[0].teamCode);
    if (rows[1]) resolved.set(`2${gName}`, rows[1].teamCode);
  }

  // Resolver mejores 3ros solo cuando los 12 grupos están completos
  if (completeGroups.length === 12) {
    const bestThirds    = rankThirdPlaceTeams(allTables, completeGroups);
    const advancingGrps = bestThirds.map(r => r.group);
    const slotMap       = assignThirdSlots(advancingGrps);

    for (const [slotCode, grpLetter] of slotMap) {
      const row = allTables.get(grpLetter)?.[2];
      if (row) resolved.set(slotCode, row.teamCode);
    }
  }

  // Resolver ganadores de knockout (R32 → R16 → QF → SF) en orden para que
  // los W-codes se resuelvan de ronda en ronda (W73 debe estar antes que W89)
  for (const round of ['R32', 'R16', 'QF', 'SF']) {
    for (const m of allMatches.filter(x => x.group === round)) {
      const live = liveScores.get(m.id);
      if (!live || live.status !== 'FINISHED') continue;
      const homeResolved = resolved.get(m.homeTeamCode) ?? m.homeTeamCode;
      const awayResolved = resolved.get(m.awayTeamCode) ?? m.awayTeamCode;
      if (live.homeScore > live.awayScore) {
        resolved.set(`W${m.id}`, homeResolved);
      } else if (live.awayScore > live.homeScore) {
        resolved.set(`W${m.id}`, awayResolved);
      }
      // Empate → requiere info de penales, no resolver por score
    }
  }

  return resolved;
}
