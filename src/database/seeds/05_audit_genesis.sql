-- Module 5: Genesis Audit Anchor & Trust Index Seeds
-- Owner: Mirath Nimsara (#z8q7hbpe4z)

INSERT INTO audit_trail (source_module, event_type, entity_id, data_hash, merkle_root, xrpl_tx_hash, xrpl_ledger_index, status)
VALUES 
  ('module-5', 'GENESIS_ANCHOR', 'genesis-block', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '7a2b9184c910482b91a429e849201a84928194d8129481928491025f1a8c92b4', '4A9D3F82E5C9A17482D42079148F2A8CD996B34A9988D4D6B9C23145E7A29F31', 8920194, 'ANCHORED')
ON CONFLICT DO NOTHING;

INSERT INTO trust_index (company_id, score, components)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 94, '{"kycVerification": 25, "escrowDiscipline": 30, "milestoneReality": 39, "complianceScore": 20, "documentVerification": 96, "escrowHealth": 95, "geofencePassRate": 98}'::jsonb)
ON CONFLICT DO NOTHING;
