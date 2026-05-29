import { NextResponse } from 'next/server';
import { staticMatches } from '@/lib/fixtures-static';

// Datos estáticos — 104 partidos del Mundial 2026.
// Esta ruta existe para que useFixtures() tenga un endpoint uniforme;
// en dev y prod devuelve el mismo dataset sin necesidad de API externa.
export async function GET() {
  return NextResponse.json({ data: staticMatches, cached: false });
}
