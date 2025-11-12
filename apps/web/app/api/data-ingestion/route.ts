import { ESPNService } from "./services/espn-service";
import { SupabaseService } from "./services/supabase-service";
import { BasketballStatisticsModel } from "./model/basketball-statistics-model";
import { SPORT_CONFIG } from "./config";

export async function GET() {
  try {
    // 1. Fetch and store players
    const players = await ESPNService.fetchPlayers();
    
    if (players.length === 0) {
      return new Response(
        JSON.stringify({ message: "No players found" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    
    await SupabaseService.storePlayers(players);

    // 2. Fetch and store stats with batching
    const batchLimit = 10;
    const allStats = [];

    for (let i = 0; i < players.length; i += batchLimit) {
      const batch = players.slice(i, i + batchLimit);
      
      const batchStats = await Promise.all(
        batch.map(async (player: any) => {
          try {
            const statsData = await ESPNService.fetchPlayerStats(player.id);
            const splits = statsData?.splitCategories?.[0]?.splits || [];

            if (splits.length === 0) {
              console.warn(`No splits found for player ${player.id}`);
              return [];
            }

            return splits
              .filter((split: any) => {
                if (!split.displayName) {
                  console.warn(`Missing location for player ${player.id}, skipping split`);
                  return false;
                }
                if (!split.stats?.length) {
                  console.warn(`No stats for player ${player.id} (${split.displayName}), skipping`);
                  return false;
                }
                return true;
              })
              .map((split: any) => ({
                playerId: player.id,
                stats: BasketballStatisticsModel.formatStatistics(split.stats),
                location: split.displayName,
                season: SPORT_CONFIG.season
              }));
          } catch (err) {
            console.error(`Error processing player ${player.id}:`, err);
            return [];
          }
        })
      );
      
      allStats.push(...batchStats.flat());
    }

    await SupabaseService.bulkUploadPlayerStats(allStats);

    return new Response(
      JSON.stringify({ message: "Players fetched and stored successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}