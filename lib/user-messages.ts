/**
 * User-facing copy for guest / unavailable / common action situations.
 * Never mention providers, env files, or internal config here.
 */

export const AUTH_UNAVAILABLE_MSG =
  "Sign-in isn’t available right now. Please try again in a few minutes.";

export const GUEST_SAVE_BLOCKED_MSG =
  "Sign in to save changes. You’re browsing as a guest right now.";

export const ACCOUNT_UPDATES_UNAVAILABLE_MSG =
  "Account updates aren’t available right now. Please try again shortly.";

export const ACCOUNT_DELETE_UNAVAILABLE_MSG =
  "Account deletion isn’t available right now. Please try again later or contact support.";

export const ADMIN_ACTION_UNAVAILABLE_MSG =
  "This admin action isn’t available right now. Please try again shortly.";

export const SIGN_IN_AGAIN_MSG = "Please sign in again to continue.";

export const GENERIC_TRY_AGAIN_MSG =
  "Something went wrong. Please try again in a moment.";

export const GENERIC_SAVE_FAILED_MSG =
  "We couldn’t save that right now. Please try again.";

export const NO_PERMISSION_MSG = "You don’t have permission for this action.";

const INTERNAL_ERROR_MARKERS = [
  "supabase",
  "postgres",
  "pgrst",
  "jwt",
  "row-level security",
  "rls",
  "violates",
  "duplicate key",
  "foreign key",
  "relation ",
  "column ",
  "schema ",
  "networkerror",
  "fetch failed",
  "econnreset",
  "etimedout",
  "internal server error",
  "service role",
  ".env",
  "stack",
  "at object.",
  "typeerror:",
  "referenceerror:",
];

function looksInternal(message: string) {
  const normalized = message.toLowerCase();
  if (!normalized || normalized === "{}" || normalized === "[object object]") return true;
  if (normalized.startsWith("error:")) return true;
  return INTERNAL_ERROR_MARKERS.some((marker) => normalized.includes(marker));
}

const KNOWN_ACTION_ERRORS: Record<string, string> = {
  "not authenticated": SIGN_IN_AGAIN_MSG,
  "not authenticated.": SIGN_IN_AGAIN_MSG,
  "unauthorized": SIGN_IN_AGAIN_MSG,
  forbidden: NO_PERMISSION_MSG,
  "forbidden.": NO_PERMISSION_MSG,
  "portfolio not found.": "That portfolio couldn’t be found. Refresh and try again.",
  "portfolio not found": "That portfolio couldn’t be found. Refresh and try again.",
  "missing id": "That portfolio couldn’t be found. Refresh and try again.",
  "missing parameters.": "Something’s missing. Refresh the page and try again.",
  "missing parameters": "Something’s missing. Refresh the page and try again.",
  "invalid symbol": "Enter a valid stock symbol.",
  "name is required": "Enter a portfolio name.",
  "target must be > 0": "Enter a target price greater than zero.",
  "could not access watchlist": "We couldn’t open your watchlist. Please try again.",
};

/**
 * Map unknown/provider errors to safe, meaningful user copy.
 * Prefer an explicit fallback for the call site when unsure.
 */
export function toUserFacingError(error: unknown, fallback = GENERIC_TRY_AGAIN_MSG): string {
  const raw =
    typeof error === "string"
      ? error
      : typeof error === "object" &&
          error &&
          "message" in error &&
          typeof (error as { message?: unknown }).message === "string"
        ? (error as { message: string }).message
        : "";

  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  const known = KNOWN_ACTION_ERRORS[trimmed.toLowerCase()];
  if (known) return known;

  if (looksInternal(trimmed)) return fallback;

  // Short, plain language messages from Zod / our own throws are fine.
  if (trimmed.length <= 160 && !/[`{}<>]|https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}
