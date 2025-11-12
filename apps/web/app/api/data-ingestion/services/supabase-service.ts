import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG } from "../config";
import { BasketballStatisticsModel } from "../model/basketball-statistics-model";

const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.serviceRoleKey
);

export class SupabaseService {
  static async storePlayers(players: any[]) {
    const formattedPlayers = players.map((player) => ({
      espn_player_id: player.id,
      name: player.fullName || `${player.firstName} ${player.lastName}`,
      team: player.team?.displayName || "Unknown",
      position: player.position?.abbreviation || "N/A",
      jersey_number: player.jersey || "N/A",
      height: player.height || null,
      weight: player.weight || null,
      year: player.class?.year || null,
      image_url: player.headshot?.href || null,
    }));

    const { error } = await supabase
      .from("players")
      .upsert(formattedPlayers, { onConflict: "espn_player_id" });

    if (error) throw error;
    
    console.log(`Successfully stored ${formattedPlayers.length} players`);
  }

  static async bulkUploadPlayerStats(
    statsArray: Array<{
      playerId: string;
      stats: BasketballStatisticsModel;
      location: string;
      season: string;
    }>
  ) {
    if (statsArray.length === 0) {
      console.log("No stats to store");
      return;
    }

    const formattedStats = statsArray.map(({ playerId, stats, location, season }) => ({
      espn_player_id: playerId,
      season: season,
      game_location: location,
      games_played: Number(stats.gamesPlayed) || 0,
      minutes_per_game: Number(stats.avgMinutes) || 0,
      field_goals_made_attempted: stats.avgFieldGoalsMadeAvgFieldGoalsAttempted || null,
      field_goal_pct: Number(stats.fieldGoalPct) || 0,
      three_point_made_attempted: stats.avgThreePointFieldGoalsMadeToAvgThreePointFieldGoalsAttempted || null,
      three_point_pct: Number(stats.threePointFieldGoalPct) || 0,
      free_throws_made_attempted: stats.freeThrowsMadeToAttemptedPerGame || null,
      free_throw_pct: Number(stats.freeThrowPercentage) || 0,
      offensive_rebounds_per_game: Number(stats.avgOffensiveRebounds) || 0,
      defensive_rebounds_per_game: Number(stats.avgDefensiveRebounds) || 0,
      rebounds_per_game: Number(stats.avgRebounds) || 0,
      assists_per_game: Number(stats.avgAssists) || 0,
      blocks_per_game: Number(stats.avgBlocks) || 0,
      steals_per_game: Number(stats.avgSteals) || 0,
      fouls_per_game: Number(stats.avgFouls) || 0,
      turnovers_per_game: Number(stats.avgTurnovers) || 0,
      points_per_game: Number(stats.avgPoints) || 0
    }));
    const { error } = await supabase
      .from("player_stats")
      .upsert(formattedStats, { onConflict: "espn_player_id,season,game_location" });

    if (error) {
      console.error("Supabase bulk upload error:", JSON.stringify(error, null, 2));
      throw error;
    }
    console.log(`Successfully bulk uploaded stats for ${formattedStats.length} player splits`);
  }
}
