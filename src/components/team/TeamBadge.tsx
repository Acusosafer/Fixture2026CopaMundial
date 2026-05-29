import Image from 'next/image';
import { getTeamByCode } from '@/lib/teams';

interface TeamBadgeProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 64,
} as const;

export function TeamBadge({ code, size = 'md', showName = false }: TeamBadgeProps) {
  const team = getTeamByCode(code);
  const px = sizeMap[size];

  if (!team) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: px,
            height: px,
            background: 'var(--border-color)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: px * 0.5,
          }}
        >
          ?
        </div>
        {showName && (
          <span
            className="font-medium truncate"
            style={{ color: 'var(--text-dim)', fontSize: size === 'sm' ? 12 : size === 'md' ? 14 : 18 }}
          >
            Desconocido
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative shrink-0 rounded-full overflow-hidden"
        style={{ width: px, height: px }}
      >
        <Image
          src={team.flagUrl}
          alt={team.nameEs}
          width={px}
          height={px}
          unoptimized
          className="object-cover w-full h-full"
        />
      </div>
      {showName && (
        <span
          className="font-semibold truncate"
          style={{
            color: 'var(--text)',
            fontSize: size === 'sm' ? 12 : size === 'md' ? 14 : 18,
          }}
        >
          {team.nameEs}
        </span>
      )}
    </div>
  );
}
