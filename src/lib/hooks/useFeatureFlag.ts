import { type FeatureFlags, isFeatureEnabled } from "../featureFlags";

export function useFeatureFlag(featureName: keyof FeatureFlags): boolean {
  return isFeatureEnabled(featureName);
}
