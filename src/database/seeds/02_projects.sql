-- Module 2: Agricultural Projects & Escrow Seeds
-- Owner: Thilina Dasun (#z8q7hbpe4v)

INSERT INTO projects (id, company_id, title, description, target_amount, funded_amount, min_investment, return_rate, region, trust_score, risk_level, status)
VALUES 
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Kurunegala Organic Vanilla Project', 'Sustainable high-density organic vanilla export plantation backed by XRPL escrow smart locks.', 10000000.00, 4200000.00, 1000.00, 22.50, 'North Western Province', 94, 'low', 'open'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Matale True Cinnamon Agroforestry', 'Ceylon Cinnamon export-grade expansion across 50 acres of certified agricultural land.', 6500000.00, 6500000.00, 500.00, 18.00, 'Central Province', 89, 'low', 'fully_funded')
ON CONFLICT (id) DO NOTHING;
