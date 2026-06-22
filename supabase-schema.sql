-- ============================================
-- MAPID PONG Tournament Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: mapidpong_players
-- Stores all registered players and groups
-- ============================================
CREATE TABLE IF NOT EXISTS mapidpong_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  wa TEXT,
  group_name TEXT,
  type TEXT NOT NULL DEFAULT 'singles' CHECK (type IN ('singles', 'doubles')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  scorer TEXT NOT NULL CHECK (scorer IN ('player1', 'player2', 'none', 'status_change')),
  new_score INTEGER NOT NULL,
  action TEXT NOT NULL,
  noted_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mapidpong_players_group ON mapidpong_players(group_name);
CREATE INDEX IF NOT EXISTS idx_mapidpong_matches_status ON mapidpong_matches(status);
CREATE INDEX IF NOT EXISTS idx_mapidpong_matches_group ON mapidpong_matches(group_name);
CREATE INDEX IF NOT EXISTS idx_mapidpong_score_logs_match ON mapidpong_score_logs(match_id);

-- ============================================
-- RLS (Row Level Security) - DISABLED AS PER REQUEST
-- ============================================
ALTER TABLE mapidpong_players DISABLE ROW LEVEL SECURITY;
ALTER TABLE mapidpong_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE mapidpong_score_logs DISABLE ROW LEVEL SECURITY;

-- Note: Policies are not needed if RLS is disabled.
-- If you had policies before, disabling RLS makes the tables fully accessible.

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
-- Function: reset_tournament
-- Used to securely clear old tournament data before a new drawing
-- ============================================
CREATE OR REPLACE FUNCTION reset_tournament()
RETURNS JSON AS $$
BEGIN
  -- Empty all tables sequentially
  -- Added WHERE id IS NOT NULL to bypass Supabase's safe_update protection
  DELETE FROM mapidpong_score_logs WHERE id IS NOT NULL;
  DELETE FROM mapidpong_matches WHERE id IS NOT NULL;
  DELETE FROM mapidpong_players WHERE id IS NOT NULL;
  
  RETURN json_build_object('success', true, 'message', 'Tournament data successfully reset');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
