import { call, delay, race, take, takeEvery } from "typed-redux-saga";
import { Action } from "@reduxjs/toolkit";

import { domSerializationSafe, toJson } from "howdju-common";
import { actions, inIframe } from "howdju-client-common";

import { logger } from "../logger";
import config from "../config";

// const EXTENSION_ID = 'amnnpakeakkebmgkgjjenjkbkhkgkadh'

export function* postExtensionMessages() {
  yield* takeEvery(
    [
      actions.extension.highlightTarget,
      actions.extension.highlightUrlLocator,
      actions.extension.messageHandlerReady,
    ],
    function* postExtensionMessagesWorker(action) {
      if (!inIframe()) {
        throw new Error(
          "should not call extension action when we are not in an extension iframe."
        );
      }
      logger.trace(
        `difficult postExtensionMessagesWorker ${JSON.stringify({ action })}`
      );
      try {
        // The extension's content script could be on any page, so allow any target origin ('*')
        window.parent.postMessage(domSerializationSafe(action), "*");
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : toJson(err);
        logger.error(
          `Error posting extension message ${toJson({ action, errMessage })}`,
          err
        );
      }

      // For some reason the content script doesn't always see the first message
      const { ack, timeout } = yield* race({
        ack: take(actions.extensionFrame.ackMessage),
        timeout: delay(config.contentScriptAckTimeoutMs),
        repostAction: call(repostMessage, action),
      });
      if (ack) {
        logger.debug("Proceeding after contentScriptAck");
      } else if (timeout) {
        logger.warn("Timed out waiting for contentScriptAck");
      } else {
        logger.error("Unknown contentScriptAck race condition");
      }
    }
  );
}

function* repostMessage(action: Action) {
  while (true) {
    yield* delay(config.contentScriptAckDelayMs);
    logger.trace(`repostMessage ${JSON.stringify({ action })}`);
    window.parent.postMessage(action, "*");
  }
}
