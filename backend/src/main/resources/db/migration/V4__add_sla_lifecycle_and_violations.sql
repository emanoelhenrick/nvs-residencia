ALTER TABLE ticket
    ADD COLUMN sla_paused_at TIMESTAMPTZ,
    ADD COLUMN tmr_paused_covered_seconds BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN tms_paused_covered_seconds BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN tmr_pause_extension_seconds BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN tms_pause_extension_seconds BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN tmr_pause_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN tms_pause_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN tmr_clock_paused BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN tms_clock_paused BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN tmr_alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN tms_alert_sent BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE ticket_event
    DROP CONSTRAINT IF EXISTS ticket_event_type_check;

ALTER TABLE ticket_event
    ADD CONSTRAINT ticket_event_type_check
        CHECK (type IN ('CREATED', 'CLASSIFIED', 'ASSIGNED', 'STATUS_CHANGED',
                        'COMMENTED', 'SLA_ALERT'));

CREATE TABLE sla_violation (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES ticket(id),
    metric VARCHAR(3) NOT NULL CHECK (metric IN ('TMR', 'TMS')),
    deadline_at TIMESTAMPTZ NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_sla_violation_ticket_metric_deadline
        UNIQUE (ticket_id, metric, deadline_at)
);

CREATE INDEX idx_sla_violation_detected_at ON sla_violation (detected_at);
