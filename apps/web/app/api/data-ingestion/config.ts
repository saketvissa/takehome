export const CORE_API_BASE = "https://sports.core.api.espn.com/v3/sports";
export const STATS_API_BASE = "https://site.web.api.espn.com/apis/common/v3/sports";
export const SPORT_CONFIG = {
  sport: "basketball",
  league: "mens-college-basketball",
  season: "2025",
};

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};
