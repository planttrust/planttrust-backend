-- Module 3: CBSL Scam Typologies Seeds
-- Owner: Imesha Ariyawansha (#z8q7hbpe4w)

INSERT INTO scam_typologies (category, title, pattern, risk_weight, description, cbsl_rule_reference)
VALUES 
  ('UNREALISTIC_RETURNS', 'Guaranteed High Returns (>30% Monthly)', 'guaranteed profit|30% per month|double your money|risk-free investment', 2.50, 'Promise of guaranteed double-digit monthly returns with no risk.', 'CBSL Direction No. 02 of 2023 on Unauthorized Schemes'),
  ('UNLICENSED_SCHEME', 'Unregulated Public Deposit Collection', 'daily deposit|interest pay-out|capital pool|collective investment scheme', 2.00, 'Collecting deposits without Central Bank commercial bank license.', 'Banking Act No. 30 of 1988, Section 2'),
  ('PYRAMID_REFERRAL', 'Multi-Level Recruitment Commission Structure', 'referral bonus|downline commission|bring 2 members|recruit investors', 2.20, 'Pyramid or multi-level referral scheme disguised as agriculture.', 'Section 83C of the Banking Act'),
  ('ANONYMOUS_DIRECTORS', 'Unverified Offshore Corporate Registry', 'eROC not found|offshore shell company|unregistered entity|anonymous partners', 1.80, 'Company cannot produce validated Department of Registrar certificate.', 'Companies Act No. 07 of 2007')
ON CONFLICT DO NOTHING;
