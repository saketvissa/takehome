-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  espn_player_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  team TEXT,
  position TEXT,
  jersey_number TEXT,
  height TEXT,
  weight TEXT,
  year TEXT, -- Freshman, Sophomore, etc.
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
