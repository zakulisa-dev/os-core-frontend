import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

export function initSetry() {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}
