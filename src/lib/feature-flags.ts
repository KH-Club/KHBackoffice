import { CalendarDays, MessageSquareQuote } from "lucide-react";

export const featureFlagDefinitions = {
  news_activities: {
    label: "News & Activities",
    description:
      "Show News in the public navigation and allow visitors to open news and activity pages.",
    icon: CalendarDays,
    defaultEnabled: true,
  },
  camp_voices: {
    label: "Camp Voices",
    description:
      "Show alumni and student stories in the Camp Voices section on the homepage.",
    icon: MessageSquareQuote,
    defaultEnabled: true,
  },
} as const;

export type FeatureFlagKey = keyof typeof featureFlagDefinitions;

export const featureFlagKeys = Object.keys(
  featureFlagDefinitions,
) as FeatureFlagKey[];

export function createDefaultFeatureFlags(): Record<FeatureFlagKey, boolean> {
  return Object.fromEntries(
    featureFlagKeys.map((key) => [
      key,
      featureFlagDefinitions[key].defaultEnabled,
    ]),
  ) as Record<FeatureFlagKey, boolean>;
}

export function isFeatureFlagKey(value: string): value is FeatureFlagKey {
  return featureFlagKeys.includes(value as FeatureFlagKey);
}
