'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Megaphone, Lock, Bell, ChevronRight, Radio } from 'lucide-react';
import { sendCustomNotification } from '@/app/actions/push';
import { useLiveScores } from '@/hooks/useLiveScores';
import { staticMatches } from '@/lib/fixtures-static';
import { getTeamByCode } from '@/lib/teams';
import { isActiveStatus } from '@/lib/live';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? 'fas2026';

interface Preset {
  label: string;
  title: string;
  body: string;
  url: string;
}

function buildPresets(matchId: number, homeEs: string, awayEs: string): Preset[] {
  return [
    {
      label: '⚽ Gol',
      title: `⚽ ¡GOOOOL!`,
      body: `${homeEs} vs ${awayEs} · Abrí la app para ver el marcador en vivo.`,
      url: `/partido/${matchId}`,
    },
    {
      label: '▶️ 2do tiempo',
      title: '▶️ ¡Comienza el 2do tiempo!',
      body: `${homeEs} vs ${awayEs} · Ya arrancó el segundo tiempo.`,
      url: `/partido/${matchId}`,
    },
    {
      label: '⏱️ T. Extra',
      title: '⏱️ ¡Tiempo extra!',
      body: `${homeEs} vs ${awayEs} · Se va a tiempo extra.`,
      url: `/partido/${matchId}`,
    },
    {
      label: '🎯 Penales',
      title: '🎯 ¡Definición por penales!',
      body: `${homeEs} vs ${awayEs} · Todo se define desde los 12 pasos.`,
      url: `/partido/${matchId}`,
    },
    {
      label: '🏁 Fin',
      title: '🏁 Fin del partido',
      body: `${homeEs} vs ${awayEs} · Mirá el resultado final en la app.`,
      url: `/partido/${matchId}`,
    },
    {
      label: '🔔 Recordatorio',
      title: `🔔 ¡En 1 hora juega ${homeEs}!`,
      body: `No te pierdas ${homeEs} vs ${awayEs} · Activá las notificaciones.`,
      url: '/',
    },
  ];
}

const FALLBACK_PRESETS: Preset[] = [
  {
    label: '🏆 Mundial',
    title: '🏆 ¡HOY EMPIEZA EL MUNDIAL!',
    body: 'México vs Sudáfrica · 16:00 ART · Estadio Ciudad de México',
    url: '/partido/1',
  },
  {
    label: '🔔 Recordatorio',
    title: '🔔 ¡Recordatorio de partido!',
    body: 'Abrí la app para no perderte nada.',
    url: '/',
  },
];

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  function tryUnlock() {
    if (pin === ADMIN_PIN) { onUnlock(); }
    else { setError(true); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xs flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={18} style={{ color: 'var(--accent)' }} />
          <span className="font-heading text-xl tracking-widest" style={{ color: 'var(--text)' }}>ADMIN</span>
        </div>
        <input
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
          placeholder="PIN de acceso"
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${error ? 'var(--live)' : 'var(--border-color)'}`,
            color: 'var(--text)',
          }}
          autoFocus
        />
        {error && <p className="text-xs" style={{ color: 'var(--live)' }}>PIN incorrecto</p>}
        <button
          onClick={tryUnlock}
          className="w-full py-3 rounded-2xl text-sm font-bold"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
        >
          Acceder
        </button>
      </div>
    </div>
  );
}

function LiveMatchPicker({
  selectedId,
  onSelect,
}: {
  selectedId: number | null;
  onSelect: (matchId: number, homeEs: string, awayEs: string) => void;
}) {
  const { scores } = useLiveScores();

  // Active or recently finished matches
  const relevantMatches = staticMatches
    .filter((m) => {
      const s = scores.get(m.id);
      if (!s) return false;
      return isActiveStatus(s.status) || s.status === 'FINISHED';
    })
    .map((m) => {
      const s = scores.get(m.id)!;
      const home = getTeamByCode(m.homeTeamCode);
      const away = getTeamByCode(m.awayTeamCode);
      return { m, s, home, away };
    })
    .filter((r) => r.home && r.away);

  if (relevantMatches.length === 0) {
    return (
      <div
        className="rounded-2xl p-3 flex items-center gap-2"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <Radio size={14} style={{ color: 'var(--text-mute)' }} />
        <p className="text-xs" style={{ color: 'var(--text-mute)' }}>
          No hay partidos en vivo ahora · los presets genéricos están activos
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] uppercase tracking-wider font-semibold px-0.5" style={{ color: 'var(--text-mute)' }}>
        Partido activo
      </p>
      <div className="flex flex-col gap-1.5">
        {relevantMatches.map(({ m, s, home, away }) => {
          const isLive = isActiveStatus(s.status);
          const isSelected = selectedId === m.id;

          const minuteLabel =
            s.status === 'PAUSED' ? 'ET' :
            s.status === 'PAUSED_ET' ? 'D.TE' :
            s.status === 'PENALTIES' ? 'PEN' :
            s.status === 'EXTRA_TIME' ? `TE ${s.minute}'` :
            s.status === 'FINISHED' ? 'FIN' :
            s.injuryTime > 0 ? `${s.minute}+${s.injuryTime}'` :
            `${s.minute}'`;

          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id, home!.nameEs, away!.nameEs)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.98]"
              style={{
                background: isSelected ? 'var(--accent-dim)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? 'var(--accent-border)' : 'var(--border-color)'}`,
              }}
            >
              {/* Home flag + name */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="relative w-6 h-4 shrink-0">
                  <Image src={home!.flagUrl} alt={home!.nameEs} fill className="object-contain" unoptimized />
                </div>
                <span className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                  {home!.nameEs}
                </span>
              </div>

              {/* Score + minute */}
              <div className="flex flex-col items-center shrink-0">
                <div className="flex items-center gap-1">
                  {isLive && (
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse-live shrink-0" style={{ background: 'var(--live)' }} />
                  )}
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: isLive ? 'var(--live)' : 'var(--text-dim)' }}
                  >
                    {s.homeScore} – {s.awayScore}
                  </span>
                </div>
                <span className="text-[9px]" style={{ color: isLive ? 'var(--live)' : 'var(--text-mute)' }}>
                  {minuteLabel}
                </span>
              </div>

              {/* Away flag + name */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                <span className="text-xs font-semibold truncate text-right" style={{ color: 'var(--text)' }}>
                  {away!.nameEs}
                </span>
                <div className="relative w-6 h-4 shrink-0">
                  <Image src={away!.flagUrl} alt={away!.nameEs} fill className="object-contain" unoptimized />
                </div>
              </div>

              {isSelected && (
                <span className="text-[10px] font-bold shrink-0" style={{ color: 'var(--accent)' }}>✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedHome, setSelectedHome] = useState('');
  const [selectedAway, setSelectedAway] = useState('');

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;

  const presets = selectedMatchId
    ? buildPresets(selectedMatchId, selectedHome, selectedAway)
    : FALLBACK_PRESETS;

  function applyPreset(p: Preset) {
    setTitle(p.title);
    setBody(p.body);
    setUrl(p.url);
    setResult(null);
  }

  function handleSelectMatch(matchId: number, homeEs: string, awayEs: string) {
    setSelectedMatchId(matchId);
    setSelectedHome(homeEs);
    setSelectedAway(awayEs);
    setUrl(`/partido/${matchId}`);
    setResult(null);
  }

  async function handleSend() {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setResult(null);
    const r = await sendCustomNotification(title, body, url);
    setSending(false);
    setResult({
      ok: r.ok,
      msg: r.ok
        ? `✓ Enviado a ${r.sent} suscriptor${r.sent === 1 ? '' : 'es'}${r.failed ? ` · ${r.failed} fallaron` : ''}`
        : `✗ ${r.error}`,
    });
  }

  const canSend = title.trim().length > 0 && body.trim().length > 0;

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col gap-5 max-w-sm mx-auto">
      <div className="flex items-center gap-2">
        <Bell size={18} style={{ color: 'var(--accent)' }} />
        <h1 className="font-heading text-2xl tracking-widest" style={{ color: 'var(--text)' }}>
          PUSH ADMIN
        </h1>
      </div>

      {/* Live match picker */}
      <LiveMatchPicker selectedId={selectedMatchId} onSelect={handleSelectMatch} />

      {/* Quick presets */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] uppercase tracking-wider font-semibold px-0.5" style={{ color: 'var(--text-mute)' }}>
          Acceso rápido
        </p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-dim)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-mute)' }}>
          Componer alerta
        </p>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>Título</label>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setResult(null); }}
            placeholder="ej: ⚽ ¡GOOOL!"
            maxLength={80}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--border-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text)',
            }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>Mensaje</label>
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); setResult(null); }}
            placeholder="ej: Brasil 1 - 0 Marruecos · Min 23'"
            maxLength={160}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{
              background: 'var(--border-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text)',
            }}
          />
          <span className="text-[10px] text-right" style={{ color: 'var(--text-mute)' }}>
            {body.length}/160
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>Destino al tocar</label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--text-mute)' }}
            >
              /
            </span>
            <input
              value={url.replace(/^\//, '')}
              onChange={(e) => { setUrl('/' + e.target.value.replace(/^\//, '')); setResult(null); }}
              placeholder="partido/8"
              className="w-full pl-5 pr-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--border-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      {(title || body) && (
        <div
          className="rounded-2xl p-4 flex flex-col gap-1.5"
          style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, var(--bg-card) 100%)',
            border: '1px solid rgba(255,215,0,0.2)',
          }}
        >
          <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-mute)' }}>
            Preview
          </p>
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
            >
              <span className="text-base">⚽</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-snug" style={{ color: 'var(--text)' }}>
                {title || <span style={{ color: 'var(--text-mute)' }}>Título…</span>}
              </p>
              <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-dim)' }}>
                {body || <span style={{ color: 'var(--text-mute)' }}>Mensaje…</span>}
              </p>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-mute)', flexShrink: 0, marginTop: 2 }} />
          </div>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={sending || !canSend}
        className="flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-40"
        style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
      >
        <Megaphone size={16} />
        {sending ? 'Enviando...' : 'Difundir a todos'}
      </button>

      {result && (
        <p
          className="text-sm text-center font-semibold py-2 rounded-xl"
          style={{
            color: result.ok ? '#10F0A0' : 'var(--live)',
            background: result.ok ? 'rgba(16,240,160,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${result.ok ? 'rgba(16,240,160,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          {result.msg}
        </p>
      )}
    </div>
  );
}
