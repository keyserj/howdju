import assign from "lodash/assign";
import throttle from "lodash/throttle";
import {
  showReportDialog as sentryShowReportDialog,
  init as sentryInit,
} from "@sentry/browser";
import { Integrations } from "@sentry/tracing";
import { Event, EventHint } from "@sentry/types";

import { apiErrorCodes, isCustomError } from "howdju-common";

import config from "./config";
import { uiErrorTypes } from "./uiErrors";
import {
  cookieConsent,
  ERROR_REPORTING,
  FULL_ERROR_REPORTING,
} from "./cookieConsent";
import { isObject } from "lodash";
import { ReportDialogOptions } from "@sentry/browser";

export default () => {
  const integrations = [];
  if (cookieConsent.isAccepted(FULL_ERROR_REPORTING)) {
    integrations.push(new Integrations.BrowserTracing());
  }
  sentryInit(
    assign(
      {
        integrations,
        beforeSend(event: Event, hint?: EventHint) {
          if (!cookieConsent.isAccepted(ERROR_REPORTING)) return null;
          if (event.exception) {
            return handleExceptionEvent(event, hint);
          }
          return event;
        },
      },
      config.sentry
    )
  );
};

function handleExceptionEvent(event: Event, hint?: EventHint) {
  let isUnexpectedError = true;

  if (hint && isCustomError(hint?.originalException)) {
    switch (hint.originalException.errorType) {
      // UI error types that we don't even want to report
      case uiErrorTypes.COMMIT_EDIT_RESULT_ERROR:
        return null;
      case uiErrorTypes.API_RESPONSE_ERROR:
        isUnexpectedError =
          "body" in hint.originalException &&
          isObject(hint.originalException.body) &&
          "errorCode" in hint.originalException.body &&
          hint.originalException.body.errorCode ===
            apiErrorCodes.UNEXPECTED_ERROR;
    }
  }

  if (isUnexpectedError) {
    // Only prompt the user when we don't know what is going on, and only prompte them occassionally
    // (E.g., if all fetches on a page fail, we don't want to show them the dialog for each failure.)
    throttledShowReportDialog({ eventId: event.event_id });
    event.level = "error";
  } else {
    // Expected exceptions are just informational
    event.level = "info";
  }

  return event;
}

function showReportDialog(options?: ReportDialogOptions) {
  sentryShowReportDialog(options);
}

const throttledShowReportDialog = throttle(
  showReportDialog,
  config.sentryShowReportDialogThrottleMs
);
