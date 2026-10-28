-- Module 4: Parcel Geofence Boundary Seeds
-- Owner: Yasuri Pradeepika (#z8q7hbpe4x)

INSERT INTO geofence_projects (project_id, company_id, name, polygon_coordinates)
VALUES 
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Kurunegala Vanilla Estate Parcel A', '[[7.4867, 80.3651], [7.4892, 80.3685], [7.4845, 80.3712], [7.4819, 80.3678], [7.4867, 80.3651]]'::jsonb),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Matale Cinnamon Estate Parcel B', '[[7.4678, 80.6234], [7.4712, 80.6278], [7.4689, 80.6312], [7.4645, 80.6267], [7.4678, 80.6234]]'::jsonb)
ON CONFLICT DO NOTHING;
