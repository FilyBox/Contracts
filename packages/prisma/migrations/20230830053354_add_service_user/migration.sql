INSERT INTO "User" ("email", "name") VALUES (
  'serviceaccount@lpm.com',
  'Service Account'
) ON CONFLICT DO NOTHING;
