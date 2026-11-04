INSERT INTO location (code, name, type)
SELECT v.code, v.name, v.type
FROM (VALUES
   ('LJ-001', 'Loja Boa Viagem', 'STORE'),
   ('LJ-002', 'Loja Recife Antigo', 'STORE'),
   ('LJ-003', 'Loja Olinda', 'STORE'),
   ('CD-001', 'CD Recife', 'DISTRIBUTION_CENTER')
) AS v(code, name, type)
WHERE NOT EXISTS (SELECT 1 FROM location l WHERE l.code = v.code);

INSERT INTO category (name)
SELECT v.name
FROM (VALUES
   ('PDV'),
   ('Pagamento'),
   ('E-commerce'),
   ('Impressora/Leitor'),
   ('Rede/Internet')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM category c WHERE c.name = v.name);

INSERT INTO team (name, level)
SELECT v.name, v.level
FROM (VALUES
   ('Suporte N1', 'N1'),
   ('Sistemas N2', 'N2'),
   ('Infraestrutura', 'INFRA'),
   ('E-commerce', 'ECOMMERCE')
) AS v(name, level)
WHERE NOT EXISTS (
   SELECT 1
   FROM team t
   WHERE t.name = v.name AND t.level = v.level
);

INSERT INTO device (location_id, type, identifier)
SELECT l.id, v.type, v.identifier
FROM (VALUES
   ('LJ-001', 'POS', 'PDV-001'),
   ('LJ-001', 'POS', 'PDV-002'),
   ('LJ-002', 'TABLET', 'TAB-001'),
   ('CD-001', 'SCANNER', 'LEI-001'),
   ('CD-001', 'LABEL_PRINTER', 'IMP-001')
) AS v(location_code, type, identifier)
JOIN location l ON l.code = v.location_code
WHERE NOT EXISTS (
   SELECT 1
   FROM device d
   WHERE d.location_id = l.id
     AND d.type = v.type
     AND d.identifier = v.identifier
);

INSERT INTO users (name, email, role, location_id, team_id)
SELECT v.name, v.email, v.role, v.location_id, v.team_id
FROM (VALUES
   ('Maria Souza', 'maria@nexo.com', 'REQUESTER', (SELECT id FROM location WHERE code = 'LJ-001'), NULL),
   ('Carlos Lima', 'carlos@nexo.com', 'REQUESTER', (SELECT id FROM location WHERE code = 'LJ-002'), NULL),
   ('Pedro Operador', 'pedro@nexo.com', 'REQUESTER', (SELECT id FROM location WHERE code = 'CD-001'), NULL),
   ('João Atendente', 'joao@nexo.com', 'TRIAGE_AGENT', NULL, (SELECT id FROM team WHERE name = 'Suporte N1')),
   ('Ana Especialista', 'ana@nexo.com', 'SPECIALIST', NULL, (SELECT id FROM team WHERE name = 'Sistemas N2')),
   ('Rui Infra', 'rui@nexo.com', 'SPECIALIST', NULL, (SELECT id FROM team WHERE name = 'Infraestrutura')),
   ('Paula Líder', 'paula@nexo.com', 'LEADER', NULL, NULL)
) AS v(name, email, role, location_id, team_id)
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.email = v.email);