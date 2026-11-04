CREATE SEQUENCE IF NOT EXISTS ticket_protocol_seq
    AS BIGINT
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS location (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('STORE', 'DISTRIBUTION_CENTER'))
);

CREATE TABLE IF NOT EXISTS category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS team (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(30) NOT NULL CHECK (level IN ('N1', 'N2', 'N3', 'INFRA', 'ECOMMERCE', 'SUPPLIER'))
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('REQUESTER', 'TRIAGE_AGENT', 'SPECIALIST', 'SUPPLIER', 'LEADER')),
    location_id BIGINT REFERENCES location(id),
    team_id BIGINT REFERENCES team(id)
);

CREATE TABLE IF NOT EXISTS device (
    id BIGSERIAL PRIMARY KEY,
    location_id BIGINT NOT NULL REFERENCES location(id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('POS', 'TABLET', 'SCANNER', 'LABEL_PRINTER', 'DESKTOP')),
    identifier VARCHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket (
    id BIGSERIAL PRIMARY KEY,
    protocol VARCHAR(30) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category_id BIGINT NOT NULL REFERENCES category(id),
    requester_id BIGINT NOT NULL REFERENCES users(id),
    location_id BIGINT NOT NULL REFERENCES location(id),
    device_id BIGINT REFERENCES device(id),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_TRIAGE', 'IN_PROGRESS', 'WAITING_REQUESTER', 'WAITING_THIRD_PARTY', 'RESOLVED', 'CLOSED', 'CANCELLED', 'REOPENED')),
    assigned_team_id BIGINT REFERENCES team(id),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_event (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES ticket(id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('CREATED', 'CLASSIFIED', 'ASSIGNED', 'STATUS_CHANGED', 'COMMENTED')),
    actor_id BIGINT REFERENCES users(id),
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_status_opened
    ON ticket (status, opened_at);

CREATE INDEX IF NOT EXISTS idx_ticket_category_location_opened
    ON ticket (category_id, location_id, opened_at);

CREATE INDEX IF NOT EXISTS idx_event_ticket_created
    ON ticket_event (ticket_id, created_at);