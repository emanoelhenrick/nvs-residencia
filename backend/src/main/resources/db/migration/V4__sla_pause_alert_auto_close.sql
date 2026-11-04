ALTER TABLE ticket
    ADD COLUMN sla_paused_at TIMESTAMPTZ,
    ADD COLUMN sla_paused_seconds BIGINT NOT NULL DEFAULT 0 CHECK (sla_paused_seconds >= 0),
    ADD COLUMN sla_paused_before_first_response_seconds BIGINT NOT NULL DEFAULT 0
        CHECK (sla_paused_before_first_response_seconds >= 0),
    ADD COLUMN sla_80_alerted_at TIMESTAMPTZ,
    ADD COLUMN requester_last_response_at TIMESTAMPTZ,
    ADD COLUMN closed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_ticket_status_resolved
    ON ticket (status, resolved_at);

ALTER TABLE ticket_event
    DROP CONSTRAINT IF EXISTS ticket_event_type_check;

ALTER TABLE ticket_event
    ADD CONSTRAINT ticket_event_type_check
    CHECK (type IN (
        'CREATED',
        'CLASSIFIED',
        'ASSIGNED',
        'STATUS_CHANGED',
        'COMMENTED',
        'SLA_PAUSED',
        'SLA_RESUMED',
        'SLA_WARNING_80',
        'AUTO_CLOSED',
        'REQUESTER_RESPONDED'
    ));
