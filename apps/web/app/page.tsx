"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Button } from "@takehome/ui/button";
import { getPlayers, comparePlayers } from "./api/actions";

type Player = {
  id: number;
  espn_player_id: string;
  name: string;
  team: string | null;
  position: string | null;
  jersey_number: string | null;
  height: string | null; // Changed to string for displayHeight
  weight: string | null; // Changed to string for displayWeight
  year: string | null;
  image_url: string | null;
};

type PlayerStats = {
  id: number;
  espn_player_id: string;
  season: string;
  game_location: string;
  games_played: number | null;
  minutes_per_game: number | null;
  field_goals_made_attempted: string | null;
  field_goal_pct: number | null;
  three_point_made_attempted: string | null;
  three_point_pct: number | null;
  free_throws_made_attempted: string | null;
  free_throw_pct: number | null;
  offensive_rebounds_per_game: number | null;
  defensive_rebounds_per_game: number | null;
  rebounds_per_game: number | null;
  assists_per_game: number | null;
  blocks_per_game: number | null;
  steals_per_game: number | null;
  fouls_per_game: number | null;
  turnovers_per_game: number | null;
  points_per_game: number | null;
};

type PlayerWithStats = Player & { stats: PlayerStats[] };

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>("");
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>("");
  const [player1Data, setPlayer1Data] = useState<PlayerWithStats | null>(null);
  const [player2Data, setPlayer2Data] = useState<PlayerWithStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch players on mount
  useEffect(() => {
    async function fetchPlayers() {
      const data = await getPlayers();
      setPlayers(data as Player[]);
    }
    fetchPlayers();
  }, []);

  // Group players by year
  const playersByYear = players.reduce((acc, player) => {
    const year = player.year || "Unknown";
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  // Sort years in order: Freshman, Sophomore, Junior, Senior, Unknown
  const yearOrder = ["Freshman", "Sophomore", "Junior", "Senior", "Unknown"];
  const sortedYears = Object.keys(playersByYear).sort((a, b) => {
    return yearOrder.indexOf(a) - yearOrder.indexOf(b);
  });

  const handleCompare = async () => {
    if (!selectedPlayer1 || !selectedPlayer2) {
      alert("Please select both players to compare");
      return;
    }

    setLoading(true);
    try {
      const { player1, player2 } = await comparePlayers(
        selectedPlayer1,
        selectedPlayer2
      );
      console.log("Player 1 data:", player1);
      console.log("Player 2 data:", player2);
      setPlayer1Data(player1 as PlayerWithStats | null);
      setPlayer2Data(player2 as PlayerWithStats | null);
      
      // Smooth scroll to comparison results
      setTimeout(() => {
        document.querySelector(`.${styles.comparisonArea}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } catch (error) {
      console.error("Error comparing players:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to aggregate home/away stats (simple average)
  const getAggregatedStats = (stats: PlayerStats[]) => {
    if (!stats || stats.length === 0) return null;
    
    // If there's only one stat row, return it
    if (stats.length === 1) return stats[0];
    
    // Average across home/away
    const aggregated: any = {};
    const numericFields = [
      'games_played', 'minutes_per_game', 'field_goal_pct', 'three_point_pct',
      'free_throw_pct', 'offensive_rebounds_per_game', 'defensive_rebounds_per_game',
      'rebounds_per_game', 'assists_per_game', 'blocks_per_game', 'steals_per_game',
      'fouls_per_game', 'turnovers_per_game', 'points_per_game'
    ];
    
    numericFields.forEach(field => {
      const values = stats.map(s => s[field as keyof PlayerStats]).filter(v => v !== null) as number[];
      aggregated[field] = values.length > 0 
        ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
        : '-';
    });
    
    return aggregated;
  };

  const player1Stats = player1Data ? getAggregatedStats(player1Data.stats) : null;
  const player2Stats = player2Data ? getAggregatedStats(player2Data.stats) : null;

  console.log("Player 1 stats aggregated:", player1Stats);
  console.log("Player 2 stats aggregated:", player2Stats);
  console.log("Player 1 data stats array:", player1Data?.stats);
  console.log("Player 2 data stats array:", player2Data?.stats);

  // Helper to determine if a stat is better (higher is better for most, lower for TO and PF)
  const isBetterStat = (stat1: any, stat2: any, lowerIsBetter = false) => {
    const val1 = parseFloat(stat1);
    const val2 = parseFloat(stat2);
    if (isNaN(val1) || isNaN(val2)) return null;
    return lowerIsBetter ? val1 < val2 : val1 > val2;
  };

  const getStatClassName = (stat1: any, stat2: any, lowerIsBetter = false) => {
    const result = isBetterStat(stat1, stat2, lowerIsBetter);
    return result === true ? styles.betterStat : '';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>2025 Men's College Basketball</h1>
        <p>Compare Player Statistics</p>
      </header>

      <main className={styles.main}>
        <section className={styles.selectionArea}>
          <h2>Select Players to Compare</h2>
          <div className={styles.playerSelectors}>
            <div className={styles.playerSelector}>
              <label htmlFor="player1">Player 1</label>
              <select
                id="player1"
                className={styles.select}
                value={selectedPlayer1}
                onChange={(e) => setSelectedPlayer1(e.target.value)}
              >
                <option value="">Select a player...</option>
                {sortedYears.map((year) => (
                  <optgroup key={year} label={year}>
                    {(playersByYear[year] || [])
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((player) => (
                        <option key={player.espn_player_id} value={player.espn_player_id}>
                          {player.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className={styles.playerSelector}>
              <label htmlFor="player2">Player 2</label>
              <select
                id="player2"
                className={styles.select}
                value={selectedPlayer2}
                onChange={(e) => setSelectedPlayer2(e.target.value)}
              >
                <option value="">Select a player...</option>
                {sortedYears.map((year) => (
                  <optgroup key={year} label={year}>
                    {(playersByYear[year] || [])
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((player) => (
                        <option key={player.espn_player_id} value={player.espn_player_id}>
                          {player.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          <Button
            onClick={handleCompare}
            className={styles.compareButton}
            disabled={loading || !selectedPlayer1 || !selectedPlayer2}
          >
            {loading ? "Loading..." : "Compare Players"}
          </Button>
        </section>

        <section className={styles.comparisonArea}>
          <h2>Player Statistics Comparison</h2>
          
          {!player1Data && !player2Data && (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📊</div>
              <h3>Ready to Compare</h3>
              <p>Select two players above and click "Compare Players" to view their statistics side by side</p>
            </div>
          )}
          
          {player1Data && player2Data && (
            <div className={styles.playerInfo}>
              <div className={styles.playerCard}>
                {player1Data.image_url && (
                  <img 
                    src={player1Data.image_url} 
                    alt={player1Data.name}
                    className={styles.playerHeadshot}
                  />
                )}
                              <div className={styles.playerCardContent}>
                <h3>
                  {player1Data.name} <span className={styles.jerseyNumber}>#{player1Data.jersey_number}</span>
                </h3>
                <div className={styles.playerStats}>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Class</span>
                    <span className={styles.statValue}>{player1Data.year}</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>HT/WT</span>
                    <span className={styles.statValue}>{player1Data.height}, {player1Data.weight}</span>
                  </div>
                </div>
              </div>
              </div>
              <div className={styles.playerCard}>
                {player2Data.image_url && (
                  <img 
                    src={player2Data.image_url} 
                    alt={player2Data.name}
                    className={styles.playerHeadshot}
                  />
                )}
                <div className={styles.playerCardContent}>
                  <h3>
                    {player2Data.name} <span className={styles.jerseyNumber}>#{player2Data.jersey_number}</span>
                  </h3>
                  <div className={styles.playerStats}>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Class</span>
                      <span className={styles.statValue}>{player2Data.year}</span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>HT/WT</span>
                      <span className={styles.statValue}>{player2Data.height}, {player2Data.weight}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.comparisonTable}>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>GP</th>
                  <th>MIN</th>
                  <th>PTS</th>
                  <th>REB</th>
                  <th>AST</th>
                  <th>FG%</th>
                  <th>3P%</th>
                  <th>FT%</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TO</th>
                  <th>PF</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.playerNameCell}>{player1Data?.name || "Player 1"}</td>
                  <td className={getStatClassName(player1Stats?.games_played, player2Stats?.games_played)}>{player1Stats?.games_played || "-"}</td>
                  <td className={getStatClassName(player1Stats?.minutes_per_game, player2Stats?.minutes_per_game)}>{player1Stats?.minutes_per_game || "-"}</td>
                  <td className={getStatClassName(player1Stats?.points_per_game, player2Stats?.points_per_game)}>{player1Stats?.points_per_game || "-"}</td>
                  <td className={getStatClassName(player1Stats?.rebounds_per_game, player2Stats?.rebounds_per_game)}>{player1Stats?.rebounds_per_game || "-"}</td>
                  <td className={getStatClassName(player1Stats?.assists_per_game, player2Stats?.assists_per_game)}>{player1Stats?.assists_per_game || "-"}</td>
                  <td className={getStatClassName(player1Stats?.field_goal_pct, player2Stats?.field_goal_pct)}>{player1Stats?.field_goal_pct ? `${player1Stats.field_goal_pct}%` : "-"}</td>
                  <td className={getStatClassName(player1Stats?.three_point_pct, player2Stats?.three_point_pct)}>{player1Stats?.three_point_pct ? `${player1Stats.three_point_pct}%` : "-"}</td>
                  <td className={getStatClassName(player1Stats?.free_throw_pct, player2Stats?.free_throw_pct)}>{player1Stats?.free_throw_pct ? `${player1Stats.free_throw_pct}%` : "-"}</td>
                  <td className={getStatClassName(player1Stats?.steals_per_game, player2Stats?.steals_per_game)}>{player1Stats?.steals_per_game || "-"}</td>
                  <td className={getStatClassName(player1Stats?.blocks_per_game, player2Stats?.blocks_per_game)}>{player1Stats?.blocks_per_game || "-"}</td>
                  <td className={getStatClassName(player1Stats?.turnovers_per_game, player2Stats?.turnovers_per_game, true)}>{player1Stats?.turnovers_per_game || "-"}</td>
                  <td className={getStatClassName(player1Stats?.fouls_per_game, player2Stats?.fouls_per_game, true)}>{player1Stats?.fouls_per_game || "-"}</td>
                </tr>
                <tr>
                  <td className={styles.playerNameCell}>{player2Data?.name || "Player 2"}</td>
                  <td className={getStatClassName(player2Stats?.games_played, player1Stats?.games_played)}>{player2Stats?.games_played || "-"}</td>
                  <td className={getStatClassName(player2Stats?.minutes_per_game, player1Stats?.minutes_per_game)}>{player2Stats?.minutes_per_game || "-"}</td>
                  <td className={getStatClassName(player2Stats?.points_per_game, player1Stats?.points_per_game)}>{player2Stats?.points_per_game || "-"}</td>
                  <td className={getStatClassName(player2Stats?.rebounds_per_game, player1Stats?.rebounds_per_game)}>{player2Stats?.rebounds_per_game || "-"}</td>
                  <td className={getStatClassName(player2Stats?.assists_per_game, player1Stats?.assists_per_game)}>{player2Stats?.assists_per_game || "-"}</td>
                  <td className={getStatClassName(player2Stats?.field_goal_pct, player1Stats?.field_goal_pct)}>{player2Stats?.field_goal_pct ? `${player2Stats.field_goal_pct}%` : "-"}</td>
                  <td className={getStatClassName(player2Stats?.three_point_pct, player1Stats?.three_point_pct)}>{player2Stats?.three_point_pct ? `${player2Stats.three_point_pct}%` : "-"}</td>
                  <td className={getStatClassName(player2Stats?.free_throw_pct, player1Stats?.free_throw_pct)}>{player2Stats?.free_throw_pct ? `${player2Stats.free_throw_pct}%` : "-"}</td>
                  <td className={getStatClassName(player2Stats?.steals_per_game, player1Stats?.steals_per_game)}>{player2Stats?.steals_per_game || "-"}</td>
                  <td className={getStatClassName(player2Stats?.blocks_per_game, player1Stats?.blocks_per_game)}>{player2Stats?.blocks_per_game || "-"}</td>
                  <td className={getStatClassName(player2Stats?.turnovers_per_game, player1Stats?.turnovers_per_game, true)}>{player2Stats?.turnovers_per_game || "-"}</td>
                  <td className={getStatClassName(player2Stats?.fouls_per_game, player1Stats?.fouls_per_game, true)}>{player2Stats?.fouls_per_game || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.visualizationArea}>
          <h2>Visualizations</h2>
          <div className={styles.charts}>
            <div className={styles.chartPlaceholder}>
              <p>Player comparison chart will be displayed here</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
