import { SPORT_CONFIG, CORE_API_BASE, STATS_API_BASE } from "../config";

export class ESPNService {
  private static buildPlayerRetrievalEndpoint(
    season = SPORT_CONFIG.season,
    sport = SPORT_CONFIG.sport,
    league = SPORT_CONFIG.league,
    params: { limit?: number; active?: boolean } = {}
  ) {
    const limit = params.limit ?? 100;
    const active = params.active ?? true;
    return `${CORE_API_BASE}/${sport}/${league}/seasons/${season}/athletes?limit=${limit}&active=${active}`;
  }

  private static buildPlayerStatsRetrievalEndpoint(
    playerId: string,
    season = SPORT_CONFIG.season,
    sport = SPORT_CONFIG.sport,
    league = SPORT_CONFIG.league
  ) {
    return `${STATS_API_BASE}/${sport}/${league}/athletes/${playerId}/splits?season=${season}`;
  }

  static async fetchPlayers() {
    const endpoint = this.buildPlayerRetrievalEndpoint(
      SPORT_CONFIG.season,
      SPORT_CONFIG.sport,
      SPORT_CONFIG.league
    );
    
    console.log(`Fetching players from: ${endpoint}`);
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`ESPN API returned ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  }

  static async fetchPlayerStats(playerId: string) {
    const endpoint = this.buildPlayerStatsRetrievalEndpoint(
      playerId,
      SPORT_CONFIG.season,
      SPORT_CONFIG.sport,
      SPORT_CONFIG.league
    );
    
    console.log(`Fetching stats for player ${playerId}`);
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`ESPN API returned ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}
