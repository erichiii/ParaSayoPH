CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'sync_brightdata_success_rates',
    '0 * * * *', 
    $$
    SELECT net.http_post(
        url:='https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/update-scraper-success-rate',
        headers:='{"Authorization": "Bearer <YOUR_SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb
    )
    $$
);