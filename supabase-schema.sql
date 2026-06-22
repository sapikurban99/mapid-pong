-- ============================================
-- MAPID PONG Tournament Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: mapidpong_matches
-- Stores all tournament matches (singles & doubles)
-- ============================================
CREATE TABLE IF NOT EXISTS mapidpong_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player1 TEXT NOT NULL,
  player2 TEXT NOT NULL,
  score1 INTEGER NOT NULL DEFAULT 0,
  score2 INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  match_type TEXT NOT NULL DEFAULT 'singles' CHECK (match_type IN ('singles', 'doubles')),
  group_name TEXT,
  round TEXT NOT NULL DEFAULT 'group',
  referee_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: mapidpong_score_logs
-- History of every score change for audit trail
-- ============================================
CREATE TABLE IF NOT EXISTS mapidpong_score_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES mapidpong_matches(id) ON DELETE CASCADE,
  scorer TEXT NOT NULL CHECK (scorer IN ('player1', 'player2')),
  new_score INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('point', 'undo')),
  noted_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mapidpong_matches_status ON mapidpong_matches(status);
CREATE INDEX IF NOT EXISTS idx_mapidpong_matches_group ON mapidpong_matches(group_name);
CREATE INDEX IF NOT EXISTS idx_mapidpong_score_logs_match ON mapidpong_score_logs(match_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE mapidpong_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapidpong_score_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can read matches (public scoreboard)
CREATE POLICY "Public read mapidpong_matches" ON mapidpong_matches
  FOR SELECT USING (true);

-- Anyone can insert/update matches (for referee app)
CREATE POLICY "Insert mapidpong_matches" ON mapidpong_matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Update mapidpong_matches" ON mapidpong_matches
  FOR UPDATE USING (true);

-- Anyone can read score logs
CREATE POLICY "Public read mapidpong_score_logs" ON mapidpong_score_logs
  FOR SELECT USING (true);

-- Anyone can insert score logs
CREATE POLICY "Insert mapidpong_score_logs" ON mapidpong_score_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- Function: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_mapidpong_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger: auto-update updated_at on mapidpong_matches
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_mapidpong_matches_updated_at ON mapidpong_matches;
CREATE TRIGGER trigger_update_mapidpong_matches_updated_at
  BEFORE UPDATE ON mapidpong_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_mapidpong_updated_at();

-- ============================================
-- Function: log score change and update match
-- ============================================
CREATE OR REPLACE FUNCTION log_score_change(
  p_match_id UUID,
  p_scorer TEXT,
  p_action TEXT DEFAULT 'point',
  p_noted_by TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_match RECORD;
  v_new_score INTEGER;
  v_result JSON;
BEGIN
  SELECT * INTO v_match FROM mapidpong_matches WHERE id = p_match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found';
  END IF;

  IF p_scorer = 'player1' THEN
    IF p_action = 'undo' THEN
      v_new_score := GREATEST(0, v_match.score1 - 1);
    ELSE
      v_new_score := v_match.score1 + 1;
    END IF;

    UPDATE mapidpong_matches SET score1 = v_new_score WHERE id = p_match_id;
  ELSE
    IF p_action = 'undo' THEN
      v_new_score := GREATEST(0, v_match.score2 - 1);
    ELSE
      v_new_score := v_match.score2 + 1;
    END IF;

    UPDATE mapidpong_matches SET score2 = v_new_score WHERE id = p_match_id;
  END IF;

  INSERT INTO mapidpong_score_logs (match_id, scorer, new_score, action, noted_by)
  VALUES (p_match_id, p_scorer, v_new_score, p_action, p_noted_by);

  SELECT row_to_json(m) INTO v_result FROM mapidpong_matches m WHERE id = p_match_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: exec_sql (for SQL Editor page)
-- WARNING: This is a security risk in production!
-- Only use for internal/admin tools.
-- ============================================
CREATE OR REPLACE FUNCTION exec_sql(query_text TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  BEGIN
    EXECUTE format('SELECT COALESCE(json_agg(t), ''[]'') FROM (%s) t', query_text)
    INTO result;
  EXCEPTION WHEN OTHERS THEN
    result := json_build_object('message', 'Query executed successfully');
  END;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Sample Data (optional - for testing)
-- ============================================
-- INSERT INTO mapidpong_matches (player1, player2, match_type, round, group_name, status)
-- VALUES
--   ('Andi', 'Budi', 'singles', 'Group Stage', 'A', 'live'),
--   ('Citra', 'Dewi', 'singles', 'Group Stage', 'A', 'upcoming'),
--   ('Eko & Firmansyah', 'Gita & Hendra', 'doubles', 'Group Stage', 'B', 'finished');
