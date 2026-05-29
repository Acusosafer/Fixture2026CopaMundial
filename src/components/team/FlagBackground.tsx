'use client';

import Image from 'next/image';

interface FlagBackgroundProps {
  flagUrl: string;
  teamName: string;
}

export function FlagBackground({ flagUrl, teamName }: FlagBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <Image
        src={flagUrl}
        alt={`Bandera de ${teamName}`}
        fill
        className="object-cover scale-125"
        style={{ filter: 'blur(8px)' }}
        priority
        unoptimized
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,14,26,0.7) 0%, rgba(10,14,26,0.95) 100%)',
        }}
      />
    </div>
  );
}
