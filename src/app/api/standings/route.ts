import { NextResponse } from 'next/server';

// Las posiciones se calculan client-side en GroupTable a partir de fixtures-static.
// Esta ruta se reserva para cuando haya resultados reales en la fase de grupos.
export async function GET(): Promise<Response> {
  return NextResponse.json({ data: [], message: 'Use client-side calculation from /api/fixtures' });
}
