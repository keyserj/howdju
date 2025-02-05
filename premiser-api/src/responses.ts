import { apiErrorCodes, httpStatusCodes } from "howdju-common";
import { HandlerResult } from "howdju-service-routes/lib/routeHandler";

import { AppProvider } from "./init";
import { ApiCallback } from "./types";

interface ResponseArgs extends HandlerResult {
  callback: ApiCallback;
}

export const ok = ({ callback, body = {}, headers }: ResponseArgs) =>
  callback({
    httpStatusCode: httpStatusCodes.OK,
    headers,
    body,
  });
export const noContent = (
  appProvider: AppProvider,
  args: Omit<ResponseArgs, "body">
) => {
  // NO CONTENT must not have a body. https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204
  if ("body" in args)
    appProvider.logger.error("noContent may not return a body.  Ignoring body");
  return args.callback({
    httpStatusCode: httpStatusCodes.NO_CONTENT,
  });
};
export const notFound = ({ callback, body }: ResponseArgs) =>
  callback({
    httpStatusCode: httpStatusCodes.NOT_FOUND,
    body,
  });
export const unauthenticated = ({
  callback,
  body = { errorCode: apiErrorCodes.UNAUTHENTICATED },
}: ResponseArgs) =>
  callback({
    httpStatusCode: httpStatusCodes.UNAUTHORIZED,
    body,
  });
export const unauthorized = ({ callback, body }: ResponseArgs) =>
  callback({
    httpStatusCode: httpStatusCodes.FORBIDDEN,
    body,
  });
export const badRequest = ({ callback, body }: ResponseArgs) =>
  callback({
    httpStatusCode: httpStatusCodes.BAD_REQUEST,
    body,
  });
export const error = ({ callback, body }: ResponseArgs) =>
  callback({
    httpStatusCode: httpStatusCodes.ERROR,
    body,
  });
export const conflict = ({ callback, body }: ResponseArgs) =>
  callback({
    httpStatusCode: httpStatusCodes.CONFLICT,
    body,
  });
