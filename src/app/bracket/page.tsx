import { GitBranch } from 'lucide-react';
import { BracketTree } from '@/components/bracket/BracketTree';

export const metadata = {
  title: 'Cruces · Mundial 2026',
};

export default function BracketPage() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header */}
      <div className="flex flex-col gap-1 pt-2 px-4">
        <div className="flex items-center gap-2">
          <GitBranch size={22} style={{ color: 'var(--accent)' }} strokeWidth={2} />
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            Cruces
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          Eliminación directa · Mundial 2026 · deslizá →
        </p>
      </div>

      {/* Bracket tree */}
      <BracketTree />

      {/* Info note */}
      <div
        className="mx-4 rounded-2xl px-4 py-3"
        style={{
          background: 'rgba(19,24,41,0.5)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mute)' }}>
          Los cruces se actualizan automáticamente al finalizar cada grupo.
          Los 16avos comienzan el 4 de julio.
        </p>
      </div>
    </div>
  );
}
