export const TTL = {
  FIXTURE_ALL: 60 * 60 * 6,     // 6h
  STANDINGS: 60 * 30,            // 30min
  TEAMS: 60 * 60 * 24,           // 24h
  SQUAD: 60 * 60 * 12,           // 12h
  MATCH_LIVE: 30,                // 30s
  MATCH_FINISHED: 60 * 60 * 24,  // 24h
  WEATHER: 60 * 15,              // 15min
  NEWS: 60 * 5,                  // 5min
} as const;
