'use client';

import Image from 'next/image';
import Link from 'next/link';
import { staticMatches } from '@/lib/fixtures-static';
import { getTeamByCode } from '@/lib/teams';
import { useBracketResolution, type BracketResolution } from '@/hooks/useBracketResolution';

// ── Layout ─────────────────────────────────────────────────────────────────────
const SH        = 74;          // R32 slot height
const CH        = 62;          // card height total
const DATE_H    = 15;          // date row height
const TEAM_H    = Math.floor((CH - DATE_H - 2) / 2); // ~22px per team row
const CW        = 112;         // card width
const CGW       = 20;          // connector gap between columns
const TH        = 8 * SH;     // total height = 592
const STEP      = CW + CGW;    // column step = 132
const HALF_W    = 4 * STEP - CGW; // 4*132 - 20 = 508

const LINE = 'rgba(255,255,255,0.2)';
const ART  = -3 * 60 * 60 * 1000;
const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function slotH(r: number) { return SH * (1 << r); }

function cardTop(r: number, i: number): number {
  const s = slotH(r);
  return s * i + Math.floor((s - CH) / 2);
}

function cardMidY(r: number, i: number): number {
  return cardTop(r, i) + Math.floor(CH / 2);
}

function fmtDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + ART);
  const h  = d.getUTCHours().toString().padStart(2, '0');
  const mi = d.getUTCMinutes().toString().padStart(2, '0');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} · ${h}:${mi}`;
}

// ── Label helper ───────────────────────────────────────────────────────────────
function labelCode(code: string): string {
  if (!code || code === 'TBD') return 'Por definir';
  if (/^W(\d+)$/.test(code)) return `Gan. P${code.slice(1)}`;
  if (/^RU(\d+)$/.test(code)) return `Sub. P${code.slice(2)}`;
  const m1 = code.match(/^(\d)([A-L])$/);
  if (m1) return `${m1[1]}° Grp ${m1[2]}`;
  if (/^\d[A-L]{2,}$/.test(code)) return `${code[0]}° 3ro`;
  return code;
}

// ── Team row inside a card ─────────────────────────────────────────────────────
function BTeam({ code, resolution }: { code: string; resolution: BracketResolution }) {
  const { confirmed, predicted } = resolution;
  const isConfirmed = confirmed.has(code);
  const isPredicted = !isConfirmed && predicted.has(code);
  const resolved = confirmed.get(code) ?? predicted.get(code) ?? code;
  const team = getTeamByCode(resolved);

  if (team) {
    return (
      <div
        className="flex items-center gap-1.5 px-2 min-w-0"
        style={{ height: TEAM_H, opacity: isPredicted ? 0.62 : 1 }}
      >
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: 17, height: 11, borderRadius: 2 }}
        >
          <Image src={team.flagUrl} alt="" fill className="object-cover" unoptimized />
        </div>
        <span
          className="truncate leading-none"
          style={{
            fontSize: '9.5px',
            fontWeight: isPredicted ? 400 : 700,
            fontStyle: isPredicted ? 'italic' : 'normal',
            color: isPredicted ? 'var(--text-dim)' : 'var(--text)',
          }}
        >
          {team.nameEs}
        </span>
        {isPredicted && (
          <span style={{ fontSize: 8, color: 'var(--text-mute)', flexShrink: 0 }}>?</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center px-2 min-w-0" style={{ height: TEAM_H }}>
      <span className="text-[8.5px] truncate leading-none" style={{ color: 'var(--text-mute)' }}>
        {labelCode(resolved)}
      </span>
    </div>
  );
}

// ── Match card ─────────────────────────────────────────────────────────────────
function BCard({
  id,
  resolution,
  gold,
}: {
  id: number;
  resolution: BracketResolution;
  gold?: boolean;
}) {
  const m = staticMatches.find((x) => x.id === id);
  if (!m) return null;

  return (
    <Link
      href={`/partido/${id}`}
      className="flex flex-col active:opacity-60 transition-opacity"
      style={{
        width: CW,
        height: CH,
        background: 'var(--bg-card)',
        border: `1px solid ${gold ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 7,
        overflow: 'hidden',
      }}
    >
      <BTeam code={m.homeTeamCode} resolution={resolution} />
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
      <BTeam code={m.awayTeamCode} resolution={resolution} />
      <div style={{ height: 1, background: 'rgba(128,128,128,0.12)', flexShrink: 0 }} />
      <div
        className="flex items-center px-2"
        style={{ height: DATE_H, background: 'var(--surface)' }}
      >
        <span
          className="truncate leading-none tabular-nums"
          style={{ fontSize: 8, color: gold ? 'rgba(255,215,0,0.8)' : 'var(--text-dim)' }}
        >
          {fmtDate(m.date)}
        </span>
      </div>
    </Link>
  );
}

// ── Connector SVG ──────────────────────────────────────────────────────────────
// converge = true → 2 matches on left merge into 1 on right (left half)
// converge = false → 1 match on left fans to 2 on right (right half)

function Connector({
  x,
  fromR,
  toR,
  units,
}: {
  x: number;
  fromR: number;
  toR: number;
  units: number; // number of "merge/split" operations
}) {
  const converge = toR > fromR;
  const xM = CGW / 2;
  const segs: string[] = [];

  for (let i = 0; i < units; i++) {
    if (converge) {
      const y1 = cardMidY(fromR, i * 2);
      const y2 = cardMidY(fromR, i * 2 + 1);
      const yM = cardMidY(toR, i);
      segs.push(
        `M 0 ${y1} H ${xM}`,
        `M 0 ${y2} H ${xM}`,
        `M ${xM} ${y1} V ${y2}`,
        `M ${xM} ${yM} H ${CGW}`,
      );
    } else {
      const yM = cardMidY(fromR, i);
      const y1 = cardMidY(toR, i * 2);
      const y2 = cardMidY(toR, i * 2 + 1);
      segs.push(
        `M 0 ${yM} H ${xM}`,
        `M ${xM} ${y1} V ${y2}`,
        `M ${xM} ${y1} H ${CGW}`,
        `M ${xM} ${y2} H ${CGW}`,
      );
    }
  }

  return (
    <svg
      className="absolute top-0 pointer-events-none"
      style={{ left: x }}
      width={CGW}
      height={TH}
    >
      <g
        stroke={LINE}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {segs.map((d, k) => (
          <path key={k} d={d} />
        ))}
      </g>
    </svg>
  );
}

// ── Half bracket ───────────────────────────────────────────────────────────────

const LEFT_ROUNDS: { r: number; ids: number[] }[] = [
  { r: 0, ids: [75, 78, 73, 76, 84, 83, 82, 81] },
  { r: 1, ids: [89, 91, 93, 94] },
  { r: 2, ids: [97, 98] },
  { r: 3, ids: [101] },
];

const RIGHT_ROUNDS: { r: number; ids: number[] }[] = [
  { r: 3, ids: [102] },
  { r: 2, ids: [99, 100] },
  { r: 1, ids: [90, 92, 95, 96] },
  { r: 0, ids: [74, 77, 79, 80, 86, 88, 85, 87] },
];

function Half({
  side,
  resolution,
}: {
  side: 'left' | 'right';
  resolution: BracketResolution;
}) {
  const rounds = side === 'left' ? LEFT_ROUNDS : RIGHT_ROUNDS;

  return (
    <div className="relative flex-shrink-0" style={{ width: HALF_W, height: TH }}>
      {/* Cards */}
      {rounds.flatMap(({ r, ids }, col) =>
        ids.map((id, idx) => (
          <div
            key={id}
            className="absolute"
            style={{ left: col * STEP, top: cardTop(r, idx) }}
          >
            <BCard id={id} resolution={resolution} />
          </div>
        )),
      )}

      {/* Connectors */}
      {rounds.slice(0, 3).map(({ r, ids }, col) => {
        const next = rounds[col + 1];
        const converge = next.r > r;
        const units = converge ? ids.length / 2 : ids.length;
        return (
          <Connector
            key={col}
            x={col * STEP + CW}
            fromR={r}
            toR={next.r}
            units={units}
          />
        );
      })}
    </div>
  );
}

// ── Final section ──────────────────────────────────────────────────────────────

const FINAL_GAP  = 18;
const TROPHY_H   = 140;
const TROPHY_PAD = 8;

function FinalSection({ resolution }: { resolution: BracketResolution }) {
  const topCard  = Math.floor(TH / 2 - CH / 2);
  const yM       = TH / 2;
  const trophyTop = topCard - TROPHY_H - TROPHY_PAD;

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: CW + FINAL_GAP * 2, height: TH }}
    >
      {/* Left SF → Final line */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={FINAL_GAP}
        height={TH}
      >
        <path
          d={`M 0 ${yM} H ${FINAL_GAP}`}
          stroke="rgba(255,215,0,0.4)"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Copa del Mundo real */}
      <div
        className="absolute flex items-end justify-center"
        style={{ left: FINAL_GAP, width: CW, top: trophyTop, height: TROPHY_H }}
      >
        <Image
          src="/trophy.png"
          alt="Copa del Mundo"
          width={105}
          height={TROPHY_H}
          className="object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"
          unoptimized
        />
      </div>

      {/* Final card */}
      <div className="absolute" style={{ left: FINAL_GAP, top: topCard }}>
        <BCard id={104} resolution={resolution} gold />
      </div>

      {/* Final → Right SF line */}
      <svg
        className="absolute top-0 pointer-events-none"
        style={{ left: FINAL_GAP + CW }}
        width={FINAL_GAP}
        height={TH}
      >
        <path
          d={`M 0 ${yM} H ${FINAL_GAP}`}
          stroke="rgba(255,215,0,0.4)"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ── Branding header ────────────────────────────────────────────────────────────

function BracketBranding() {
  const totalW = HALF_W * 2 + CW + FINAL_GAP * 2;
  return (
    <div
      className="flex items-center justify-center mb-3 flex-shrink-0"
      style={{ width: totalW }}
    >
      <span
        className="text-[9px] font-bold tracking-[0.25em] uppercase"
        style={{ color: 'var(--text-dim)', opacity: 0.5 }}
      >
        FAS Analytics
      </span>
    </div>
  );
}

// ── Round labels row ───────────────────────────────────────────────────────────

const LEFT_LABELS  = ['16vos', 'Octavos', 'Cuartos', 'Semis'];
const RIGHT_LABELS = ['Semis', 'Cuartos', 'Octavos', '16vos'];

function LabelsRow() {
  const totalW = HALF_W * 2 + CW + FINAL_GAP * 2;

  return (
    <div className="flex flex-col flex-shrink-0 mb-2" style={{ width: totalW }}>
      {/* LADO A / LADO B header */}
      <div className="flex items-center mb-1" style={{ width: totalW }}>
        <div
          className="text-center text-[9px] font-black uppercase tracking-widest flex-shrink-0"
          style={{ width: HALF_W, color: 'var(--accent)', opacity: 0.75 }}
        >
          Lado A
        </div>
        <div style={{ width: CW + FINAL_GAP * 2 }} />
        <div
          className="text-center text-[9px] font-black uppercase tracking-widest flex-shrink-0"
          style={{ width: HALF_W, color: 'var(--accent)', opacity: 0.75 }}
        >
          Lado B
        </div>
      </div>

      {/* Round labels */}
      <div className="flex items-center" style={{ width: totalW }}>
        {/* Left labels */}
        {LEFT_LABELS.map((lbl, i) => (
          <div
            key={lbl}
            className="text-center text-[8px] font-semibold uppercase tracking-wider flex-shrink-0"
            style={{
              width: CW,
              marginRight: i < 3 ? CGW : 0,
              color: 'var(--text-mute)',
              opacity: 0.55,
            }}
          >
            {lbl}
          </div>
        ))}

        {/* Final label */}
        <div
          className="text-center text-[8px] font-black uppercase tracking-wider flex-shrink-0"
          style={{
            width: CW + FINAL_GAP * 2,
            color: '#FFD700',
            opacity: 0.7,
          }}
        >
          Final · 19 jul
        </div>

        {/* Right labels */}
        {RIGHT_LABELS.map((lbl, i) => (
          <div
            key={lbl}
            className="text-center text-[8px] font-semibold uppercase tracking-wider flex-shrink-0"
            style={{
              width: CW,
              marginLeft: i > 0 ? CGW : 0,
              color: 'var(--text-mute)',
              opacity: 0.55,
            }}
          >
            {lbl}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function BracketTree() {
  const resolution = useBracketResolution();

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-4 select-none">
      <div style={{ minWidth: 'max-content' }}>
        <BracketBranding />
        <LabelsRow />
        <div className="flex items-stretch">
          <Half side="left" resolution={resolution} />
          <FinalSection resolution={resolution} />
          <Half side="right" resolution={resolution} />
        </div>
      </div>
    </div>
  );
}
