import * as Sentry from '@sentry/react';

// Browser error monitoring only. No session replay, performance tracing,
// user identity, form payloads, or network response bodies are collected.
const dsn = import.meta.env.VITE_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend(event) {
      delete event.user;
      delete event.request;
      delete event.breadcrumbs;
      if (event.extra) delete event.extra;
      return event;
    },
  });
}
