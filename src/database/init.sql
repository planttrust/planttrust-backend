-- PlanTrust Unified PostgreSQL Database Schema
-- Modules:
--   1: User Management & Corporate Registry
--   2: Investor Marketplace & Investment Lifecycle
--   3: MCP-Driven Explainable AI & Chatbot
--   4: Company Portal & Proof-of-Reality (Geofencing)
--   5: Blockchain Auditing & Regulatory Dashboard

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Module 1: Users & Corporate Registry ────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'investor', 'company', 'admin', 'user'
  phone VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID,
  document_type VARCHAR(100) NOT NULL, -- 'deed', 'corporate_registry', 'tax_clearance'
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'approved', 'rejected'
  ocr_confidence NUMERIC(5, 2),
  extracted_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'revoked'
  data_hash VARCHAR(64) NOT NULL,
  xrpl_tx_hash VARCHAR(100),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Module 2: Investor Marketplace & Escrow Lifecycle ───────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount NUMERIC(15, 2) NOT NULL,
  funded_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  min_investment NUMERIC(15, 2) NOT NULL DEFAULT 100.00,
  return_rate NUMERIC(5, 2),
  region VARCHAR(100),
  trust_score INTEGER DEFAULT 0,
  risk_level VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high'
  status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'fully_funded', 'closed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escrow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE RESTRICT,
  investor_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  amount NUMERIC(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'CREATED', -- 'CREATED', 'FUNDED', 'LOCKED', 'RELEASED', 'REFUNDED'
  xrpl_tx_hash VARCHAR(100),
  nft_token_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p2p_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id),
  buyer_id UUID REFERENCES users(id),
  escrow_id UUID REFERENCES escrow_records(id),
  token_id VARCHAR(100),
  amount NUMERIC(15, 2) NOT NULL,
  price NUMERIC(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'CANCELLED'
  xrpl_tx_hash VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Module 3: MCP-Driven Explainable AI & Chatbot ───────────────────────────

CREATE TABLE IF NOT EXISTS scam_typologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  pattern TEXT NOT NULL,
  risk_weight NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
  description TEXT,
  cbsl_rule_reference VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  target_url VARCHAR(500),
  target_entity VARCHAR(255),
  risk_score NUMERIC(5, 2),
  typology_matches JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed_scam', 'cleared'
  xrpl_tx_hash VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Module 4: Proof-of-Reality & Geofencing ─────────────────────────────────

CREATE TABLE IF NOT EXISTS geofence_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  polygon_coordinates JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE RESTRICT,
  company_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  milestone_index INTEGER NOT NULL DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  exif_latitude NUMERIC(10, 7),
  exif_longitude NUMERIC(10, 7),
  is_geofence_valid BOOLEAN DEFAULT FALSE,
  dhash VARCHAR(64),
  anti_spoofing_score NUMERIC(5, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'VERIFIED', 'APPROVED', 'REJECTED'
  xrpl_tx_hash VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Module 5: Blockchain Auditing & Regulatory Dashboard ────────────────────

CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_module VARCHAR(50) NOT NULL, -- 'module-1', 'module-2', 'module-3', 'module-4', 'module-5'
  event_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  data_hash VARCHAR(64) NOT NULL,
  merkle_root VARCHAR(64),
  xrpl_tx_hash VARCHAR(100),
  xrpl_ledger_index BIGINT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ANCHORED', 'CONFIRMED'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  components JSONB NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes for High-Velocity Queries ───────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_company ON certificates(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_escrow_project ON escrow_records(project_id);
CREATE INDEX IF NOT EXISTS idx_escrow_investor ON escrow_records(investor_id);
CREATE INDEX IF NOT EXISTS idx_audit_data_hash ON audit_trail(data_hash);
CREATE INDEX IF NOT EXISTS idx_audit_source_module ON audit_trail(source_module);
CREATE INDEX IF NOT EXISTS idx_trust_index_company ON trust_index(company_id);
