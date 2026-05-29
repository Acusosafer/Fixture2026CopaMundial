export function getWeatherMessage(
  temp: number,
  condition: string,
  matchHour: number
): string | null {
  const rounded = Math.round(temp);
  const isNight = matchHour >= 19;
  const lc = condition.toLowerCase();
  const hasRain =
    lc.includes('lluvia') ||
    lc.includes('tormenta') ||
    lc.includes('chaparr') ||
    lc.includes('rain') ||
    lc.includes('storm');

  if (hasRain) return `🌧️ Lluvia — plan de sillón perfecto`;
  if (temp < 8 && isNight) return `🧥 ${rounded}°C esta noche — llevá campera al bar`;
  if (temp < 8 && !isNight) return `🧥 ${rounded}°C — abrigate antes de salir`;
  if (temp > 28 && matchHour < 15) return `🌡️ ${rounded}°C — prendé el aire para el partido`;
  return null;
}
