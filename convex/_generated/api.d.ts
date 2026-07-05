/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _utils from "../_utils.js";
import type * as conversations from "../conversations.js";
import type * as friends from "../friends.js";
import type * as groups from "../groups.js";
import type * as hooks_useConversation from "../hooks/useConversation.js";
import type * as hooks_useMutationState from "../hooks/useMutationState.js";
import type * as hooks_useNavigation from "../hooks/useNavigation.js";
import type * as hooks_useStoreUser from "../hooks/useStoreUser.js";
import type * as http from "../http.js";
import type * as requests from "../requests.js";
import type * as user from "../user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _utils: typeof _utils;
  conversations: typeof conversations;
  friends: typeof friends;
  groups: typeof groups;
  "hooks/useConversation": typeof hooks_useConversation;
  "hooks/useMutationState": typeof hooks_useMutationState;
  "hooks/useNavigation": typeof hooks_useNavigation;
  "hooks/useStoreUser": typeof hooks_useStoreUser;
  http: typeof http;
  requests: typeof requests;
  user: typeof user;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
