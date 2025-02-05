import { assign, forEach, isEmpty, isUndefined, toPairs } from "lodash";
import { match } from "path-to-regexp";

import {
  apiErrorCodes,
  formatZodError,
  isCustomError,
  logger,
  toJson,
} from "howdju-common";
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DownstreamServiceError,
  EntityConflictError,
  EntityNotFoundError,
  EntityTooOldToModifyError,
  EntityValidationError,
  InvalidLoginError,
  InvalidRequestError,
  NoMatchingRouteError,
  RegistrationAlreadyConsumedError,
  RegistrationExpiredError,
  RequestValidationError,
  UserActionsConflictError,
  UserIsInactiveError,
} from "howdju-service-common";
import { serviceRoutes } from "howdju-service-routes";

import {
  badRequest,
  conflict,
  error,
  notFound,
  ok,
  unauthenticated,
  unauthorized,
} from "./responses";
import { AppProvider } from "./init";
import { Request, ApiCallback } from "./types";

export async function routeRequest(
  request: Request,
  appProvider: AppProvider,
  callback: ApiCallback
) {
  // Our OPTIONS route was a no-op anyways, so handle it here so that all our routes can be more
  // route-like (e.g. all have a path.)
  if (request.method === "OPTIONS") {
    return ok({ callback });
  }

  try {
    const { route, routedRequest } = selectRoute(appProvider, request);
    if ("authToken" in route.request.schema.shape) {
      if (!request.authToken) {
        throw new AuthenticationError("Must send auth token");
      }
      await appProvider.authService.readUserIdForAuthToken(request.authToken);
    }

    const parseResult = route.request.schema
      // Allow props like authToken to go through even if not explicitly in the schema.
      .passthrough()
      .safeParse(routedRequest);
    if (parseResult.success) {
      // TODO: pass userId to just those handlers that declared Authed.
      const result = await route.request.handler(
        appProvider,
        parseResult.data as any
      );
      return ok({ callback, ...result });
    }
    return badRequest({
      callback,
      body: {
        errorCode: apiErrorCodes.VALIDATION_ERROR,
        errors: formatZodError<any>(parseResult.error),
      },
    });
  } catch (err) {
    if (err instanceof InvalidRequestError) {
      return badRequest({
        callback,
        body: {
          errorCode: apiErrorCodes.INVALID_REQUEST,
          errors: [err.message],
        },
      });
    }
    if (err instanceof EntityValidationError) {
      return badRequest({
        callback,
        body: {
          errorCode: apiErrorCodes.VALIDATION_ERROR,
          errors: err.errors,
        },
      });
    } else if (err instanceof RequestValidationError) {
      return badRequest({ callback, body: { message: err.message } });
    } else if (err instanceof EntityNotFoundError) {
      return notFound({
        callback,
        body: {
          errorCode: apiErrorCodes.ENTITY_NOT_FOUND,
          entityType: err.entityType,
          identifier: err.identifier,
        },
      });
    } else if (err instanceof NoMatchingRouteError) {
      return notFound({
        callback,
        body: { errorCode: apiErrorCodes.ROUTE_NOT_FOUND },
      });
    } else if (err instanceof AuthenticationError) {
      return unauthenticated({ callback });
    } else if (err instanceof InvalidLoginError) {
      return badRequest({
        callback,
        body: {
          errorCode: apiErrorCodes.INVALID_LOGIN_CREDENTIALS,
        },
      });
    } else if (err instanceof AuthorizationError) {
      return unauthorized({
        callback,
        body: {
          errorCode: apiErrorCodes.AUTHORIZATION_ERROR,
          errors: err.errors,
        },
      });
    } else if (err instanceof UserIsInactiveError) {
      return error({
        callback,
        body: {
          errorCode: apiErrorCodes.USER_IS_INACTIVE_ERROR,
        },
      });
    } else if (err instanceof EntityConflictError) {
      return conflict({
        callback,
        body: {
          errorCode: apiErrorCodes.ENTITY_CONFLICT,
          errors: err.errors,
        },
      });
    } else if (err instanceof EntityTooOldToModifyError) {
      return conflict({
        callback,
        body: {
          message: err.message,
        },
      });
    } else if (err instanceof ConflictError) {
      return conflict({
        callback,
        body: {
          message: err.message,
        },
      });
    } else if (err instanceof UserActionsConflictError) {
      return error({
        callback,
        body: {
          errorCode: apiErrorCodes.USER_ACTIONS_CONFLICT,
          errors: err.errors,
        },
      });
    } else if (err instanceof RegistrationExpiredError) {
      return notFound({
        callback,
        body: {
          errorCode: apiErrorCodes.EXPIRED,
        },
      });
    } else if (err instanceof RegistrationAlreadyConsumedError) {
      return notFound({
        callback,
        body: {
          errorCode: apiErrorCodes.CONSUMED,
        },
      });
    } else if (err instanceof DownstreamServiceError) {
      logger.error("Downstream service error", {
        err,
        stack: err.stack,
        sourceError: err.sourceError,
      });
      return error({
        callback,
        body: {
          errorCode: apiErrorCodes.DOWNSTREAM_SERVICE_ERROR,
        },
      });
    } else if (err instanceof Error) {
      if (isCustomError(err)) {
        appProvider.logger.error("Custom error", {
          err,
          stack: err.stack,
          sourceError: err.sourceError,
        });
        return error({
          callback,
          body: { errorCode: apiErrorCodes.UNEXPECTED_ERROR },
        });
      }
      appProvider.logger.error("Unexpected error", { err, stack: err.stack });
      return error({
        callback,
        body: { errorCode: apiErrorCodes.UNEXPECTED_ERROR },
      });
    } else {
      appProvider.logger.error("Caught unexpected non-error:", toJson(err));
      return error({
        callback,
        body: { errorCode: apiErrorCodes.UNEXPECTED_ERROR },
      });
    }
  }
}

const serviceRoutePairs = toPairs(serviceRoutes);

export function selectRoute(appProvider: AppProvider, request: Request) {
  const { path, method, queryStringParams } = request;

  for (const [routeId, route] of serviceRoutePairs) {
    let pathParams;

    if (route.method !== method) continue;

    if ("path" in route) {
      const pathPattern = route.path;
      const pathMatcher = match<Record<string, string>>(pathPattern, {
        decode: decodeURIComponent,
      });
      const result = pathMatcher(path);
      if (!result) {
        continue;
      }
      pathParams = result.params;
    }

    if ("queryStringParams" in route) {
      if (isEmpty(route.queryStringParams) !== isEmpty(queryStringParams)) {
        continue;
      }

      let isMisMatch = false;
      forEach(route.queryStringParams, (value: string | RegExp, name) => {
        const requestValue = queryStringParams[name] || "";
        if (value instanceof RegExp) {
          // The regex methods cast undefined to the string 'undefined', matching some regexes you might not expect...
          if (isUndefined(requestValue) || !value.test(requestValue)) {
            isMisMatch = true;
          }
        } else if (value !== requestValue) {
          isMisMatch = true;
        }
      });
      if (isMisMatch) {
        continue;
      }
    }

    // First item is the whole match, rest are the group matches
    const routedRequest = assign({}, request, { pathParams });
    appProvider.logger.debug(`selected route ${routeId}`);
    return { route, routedRequest };
  }

  throw new NoMatchingRouteError();
}
