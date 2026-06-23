# Production Monitoring and Alerting

This runbook defines how Creator Nexus detects production issues quickly and what to do when alerts fire.

## 1) Monitoring Stack

- Error tracking: Sentry via `@sentry/nextjs`
- Synthetic checks: GitHub Actions workflow in `.github/workflows/production-smoke.yml`
- Health endpoint: `/api/health`
- Optional alert transport: Slack webhook (`SLACK_WEBHOOK_URL` secret)

## 2) Environment Variables

Configure these in production:

- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN` (server-side DSN, optional if using only public DSN)
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN` (required for source map upload)
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` (default `0.1`)
- `NEXT_PUBLIC_APP_ENV` (for example `production`)

Configure these in GitHub repository settings:

- Variable: `PRODUCTION_BASE_URL` (for example `https://creatornexuspro.com`)
- Secret: `SLACK_WEBHOOK_URL` (optional)

## 3) Alert Thresholds

Use these initial production thresholds:

- Sev 1:
  - Availability below 99.9% over 24h on synthetic checks
  - Smoke test failure on two consecutive runs
  - Any sustained 5xx rate above 1% for 5 minutes
- Sev 2:
  - Sudden increase in 401/403 responses on public routes
  - p95 latency above 2000ms for key page/API transactions for 10 minutes
- Sev 3:
  - Isolated non-reproducible client errors affecting low traffic

## 4) Incident Response

When an alert fires:

1. Confirm impact quickly:
   - Run `npm run smoke -- --base-url https://creatornexuspro.com` locally.
2. Identify source:
   - Check Sentry issue traces and release tags.
   - Check latest deploy and configuration changes.
3. Mitigate:
   - Roll back if a fresh deploy introduced regression.
   - Patch and redeploy if rollback is not viable.
4. Verify:
   - Re-run smoke checks.
   - Confirm Sentry error volume returns to baseline.

## 5) Ongoing Operations

- Review Sentry top issues weekly.
- Keep `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` low (0.05-0.2) to control cost.
- Expand smoke coverage whenever a new critical route is added.