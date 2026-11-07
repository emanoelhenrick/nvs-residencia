ALTER TABLE ticket
    ADD COLUMN priority VARCHAR(2)
        CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
    ADD COLUMN first_response_at TIMESTAMPTZ,
    ADD COLUMN resolved_at TIMESTAMPTZ;
