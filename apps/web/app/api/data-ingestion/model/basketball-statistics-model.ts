// Define the order of keys exactly as they appear in ESPN's stats[] array
// Order: GP, MIN, FG, FG%, 3PT, 3P%, FT, FT%, OR, DR, REB, AST, BLK, STL, PF, TO, PTS
const STAT_KEYS = [
  "gamesPlayed",
  "avgMinutes",
  "avgFieldGoalsMadeAvgFieldGoalsAttempted",
  "fieldGoalPct",
  "avgThreePointFieldGoalsMadeToAvgThreePointFieldGoalsAttempted",
  "threePointFieldGoalPct",
  "freeThrowsMadeToAttemptedPerGame",
  "freeThrowPercentage",
  "avgOffensiveRebounds",
  "avgDefensiveRebounds",
  "avgRebounds",
  "avgAssists",
  "avgBlocks",
  "avgSteals",
  "avgFouls",
  "avgTurnovers",
  "avgPoints",
] as const;

export type BasketballStatisticsModel = Record<typeof STAT_KEYS[number], string>;

export namespace BasketballStatisticsModel {
  export function formatStatistics(stats: string[]): BasketballStatisticsModel {
    const result: Record<string, string> = {};
    STAT_KEYS.forEach((key, index) => {
      result[key] = stats[index] || "";
    });
    return result as BasketballStatisticsModel;
  }
}