-- Tracking table for server-side funnel analytics (KSA-valid rows use traffic_valid).
-- Safe to run multiple times (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS tracking_events (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    path VARCHAR(512),
    meta JSONB DEFAULT '{}'::jsonb,
    client_ip VARCHAR(45),
    traffic_valid BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_tracking_events_created_at ON tracking_events (created_at);
CREATE INDEX IF NOT EXISTS ix_tracking_events_valid_created ON tracking_events (traffic_valid, created_at);
CREATE INDEX IF NOT EXISTS ix_tracking_events_session ON tracking_events (session_id);
CREATE INDEX IF NOT EXISTS ix_tracking_events_type ON tracking_events (event_type);
