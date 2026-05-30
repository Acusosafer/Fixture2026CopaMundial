'use client';

interface FlagBackgroundProps {
  flagUrl?: string;
  teamName?: string;
}

export function FlagBackground(_props: FlagBackgroundProps) {
  return (
    <div className="hero-degradado" aria-hidden="true">
      <div className="hero-degradado-base" />
      <div className="hero-degradado-glow" />
      <div className="hero-degradado-noise" />
    </div>
  );
}
