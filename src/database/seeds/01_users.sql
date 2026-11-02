-- Module 1: User & Corporate Registry Seeds
-- Owner: Nimsara Karunarathna (#z8q7hbpe4u)

INSERT INTO users (id, name, email, password, role, phone)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@planttrust.io', '$2a$10$wK3GgU9q7j2vR1v8L2fHveoQx6PZ1vK9H7j3bK1x1y1z1a1b1c1d1', 'admin', '+94 11 234 5678'),
  ('00000000-0000-0000-0000-000000000002', 'GreenAgri Plantations PLC', 'contact@greenagri.lk', '$2a$10$wK3GgU9q7j2vR1v8L2fHveoQx6PZ1vK9H7j3bK1x1y1z1a1b1c1d1', 'company', '+94 37 456 7890'),
  ('00000000-0000-0000-0000-000000000003', 'Institutional Investor Alpha', 'investor@alpha.com', '$2a$10$wK3GgU9q7j2vR1v8L2fHveoQx6PZ1vK9H7j3bK1x1y1z1a1b1c1d1', 'investor', '+94 77 123 4567')
ON CONFLICT (email) DO NOTHING;
