/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as announcements from "../announcements.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as discussions from "../discussions.js";
import type * as events from "../events.js";
import type * as history from "../history.js";
import type * as migration from "../migration.js";
import type * as photos from "../photos.js";
import type * as push from "../push.js";
import type * as recommendations from "../recommendations.js";
import type * as registrations from "../registrations.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  analytics: typeof analytics;
  announcements: typeof announcements;
  auth: typeof auth;
  crons: typeof crons;
  discussions: typeof discussions;
  events: typeof events;
  history: typeof history;
  migration: typeof migration;
  photos: typeof photos;
  push: typeof push;
  recommendations: typeof recommendations;
  registrations: typeof registrations;
  users: typeof users;
  utils: typeof utils;
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
