/**
 * Re-exports the shared Multi-cluster Alerting v2 dashboard for the
 * AI Hub – Autonomous agentic plans (MVP) prototype.
 *
 * The alerting page lives in `observability-agentic-troubleshooting-ai`
 * and uses the fixed kuklas-aligned mock clusters.  Importing it here
 * avoids duplicating ~2 000 lines of page code while keeping the AI Hub
 * prototype's route self-contained.
 */
export { MultiClusterAlertingDashboard as SummitFleetAlertingPage } from '@app/prototypes/observability-agentic-troubleshooting-ai/pages/alerting-fleet-copy/pages/MultiClusterAlertsPage';
