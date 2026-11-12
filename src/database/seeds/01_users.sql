-- Module 1: User & Corporate Registry Seeds
-- Owner: Nimsara Karunarathna (#z8q7hbpe4u)
-- Default Demo Password for all seeded accounts: SecurePass123! (bcrypt 10 rounds, 60 chars)

INSERT INTO users (id, name, email, password, role, phone)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@planttrust.io', '$2a$10$wK3GgU9q7j2vR1v8L2fHvesMtiAx9AKxaiX4N9kEE8ECqEgwnrMjK', 'admin', '+94 11 234 5678'),
  ('00000000-0000-0000-0000-000000000002', 'GreenAgri Plantations PLC', 'contact@greenagri.lk', '$2a$10$wK3GgU9q7j2vR1v8L2fHvesMtiAx9AKxaiX4N9kEE8ECqEgwnrMjK', 'company', '+94 37 456 7890'),
  ('00000000-0000-0000-0000-000000000003', 'Institutional Investor Alpha', 'investor@alpha.com', '$2a$10$wK3GgU9q7j2vR1v8L2fHvesMtiAx9AKxaiX4N9kEE8ECqEgwnrMjK', 'investor', '+94 77 123 4567'),
  ('00000000-0000-0000-0000-000000000004', 'Aiden Perera (Investor)', 'aiden.investor@planttrust.org', '$2a$10$wK3GgU9q7j2vR1v8L2fHvesMtiAx9AKxaiX4N9kEE8ECqEgwnrMjK', 'investor', '+94 77 456 7891'),
  ('00000000-0000-0000-0000-000000000005', 'Ceylon Agro Plantations PLC', 'projects@ceylonagro.lk', '$2a$10$wK3GgU9q7j2vR1v8L2fHvesMtiAx9AKxaiX4N9kEE8ECqEgwnrMjK', 'company', '+94 11 890 1234'),
  ('00000000-0000-0000-0000-000000000006', 'CBSL Regulatory Compliance', 'compliance@planttrust.org', '$2a$10$wK3GgU9q7j2vR1v8L2fHvesMtiAx9AKxaiX4N9kEE8ECqEgwnrMjK', 'admin', '+94 11 247 7000')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
