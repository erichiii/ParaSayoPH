CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'daily-delta-scrape',
  '0 2 * * *',
  $$
  SELECT net.http_post(
      url:='https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/trigger-scraper',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer <YOUR_ANON_KEY>"}'::jsonb,
      body:='{"mode": "delta"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'monthly-full-scrape',
  '0 2 1 * *',
  $$
  SELECT net.http_post(
      url:='https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/trigger-scraper',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer <YOUR_ANON_KEY>"}'::jsonb,
      body:='{"mode": "full"}'::jsonb
  );
  $$
);