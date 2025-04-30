import type { APIContext, MiddlewareNext } from "astro";
import { currentFeatureFlags, type FeatureFlags } from "../lib/featureFlags";

export async function featureFlagMiddleware(
  context: APIContext,
  next: MiddlewareNext,
  requiredFeature: keyof FeatureFlags
) {
  if (!currentFeatureFlags || !currentFeatureFlags[requiredFeature]) {
    return new Response(
      JSON.stringify({
        error: "Feature not available",
        code: "FEATURE_DISABLED",
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return next();
}
