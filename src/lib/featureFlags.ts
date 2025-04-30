import { z } from "zod";

export type Environment = "dev" | "integration" | "production" | string;

export interface FeatureFlags {
  registerEnabled: boolean;
}

const featureFlagsSchema = z.object({
  registerEnabled: z.boolean(),
});

const FEATURE_CONFIG: Record<string, FeatureFlags> = {
  dev: {
    registerEnabled: true,
  },
  integration: {
    registerEnabled: false,
  },
  production: {
    registerEnabled: false,
  },
};

export function getFeatureFlags(env: string): FeatureFlags | null {
  if (!Object.prototype.hasOwnProperty.call(FEATURE_CONFIG, env)) {
    return null;
  }

  const config = FEATURE_CONFIG[env];
  try {
    return featureFlagsSchema.parse(config);
  } catch (error) {
    console.error(`Invalid feature flags configuration for environment ${env}:`, error);
    return null;
  }
}

function resolveCurrentEnv(): string | null {
  if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_ENV_NAME) {
    return import.meta.env.PUBLIC_ENV_NAME;
  }

  if (typeof process !== "undefined" && process.env?.PUBLIC_ENV_NAME) {
    return process.env.PUBLIC_ENV_NAME;
  }

  console.warn("No environment detected. Feature flags will be disabled.");
  return null;
}

export const currentEnv: string | null = resolveCurrentEnv();
export const currentFeatureFlags: FeatureFlags | null = currentEnv ? getFeatureFlags(currentEnv) : null;

// Helper hooks and utilities for React components
export function isFeatureEnabled(featureName: keyof FeatureFlags): boolean {
  if (!currentFeatureFlags) {
    return false;
  }
  return currentFeatureFlags[featureName] ?? false;
}
