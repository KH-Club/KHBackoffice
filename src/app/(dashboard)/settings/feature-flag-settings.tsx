"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import {
  featureFlagDefinitions,
  featureFlagKeys,
  type FeatureFlagKey,
} from "@/lib/feature-flags";

interface FeatureFlagSettingsProps {
  initialFlags: Record<FeatureFlagKey, boolean>;
  userId: string;
  isConfigured: boolean;
}

export function FeatureFlagSettings({
  initialFlags,
  userId,
  isConfigured,
}: FeatureFlagSettingsProps) {
  const [flags, setFlags] = useState(initialFlags);
  const [pendingKey, setPendingKey] = useState<FeatureFlagKey | null>(null);

  const updateFlag = async (key: FeatureFlagKey, enabled: boolean) => {
    const previousValue = flags[key];

    setFlags((currentFlags) => ({ ...currentFlags, [key]: enabled }));
    setPendingKey(key);

    const supabase = createClient();
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled, updated_by: userId })
      .eq("key", key);

    if (error) {
      setFlags((currentFlags) => ({
        ...currentFlags,
        [key]: previousValue,
      }));
      toast.error("Could not update website visibility");
    } else {
      const feature = featureFlagDefinitions[key];
      toast.success(
        `${feature.label} is now ${enabled ? "visible" : "hidden"}`,
      );
    }

    setPendingKey(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website visibility</CardTitle>
        <CardDescription>
          Turn public website sections on or off without deleting their content.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {!isConfigured ? (
          <div className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            Feature flags are not configured in Supabase yet. Run the setup SQL
            in <code className="font-mono">docs/feature-flags.md</code> before
            using these controls.
          </div>
        ) : null}

        {featureFlagKeys.map((key) => {
          const definition = featureFlagDefinitions[key];
          const Icon = definition.icon;
          const enabled = flags[key];
          const isPending = pendingKey === key;

          return (
            <div
              key={key}
              className="flex min-h-20 items-center gap-4 border-b py-4 last:border-b-0"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-5" aria-hidden />
              </div>
              <label
                className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1"
                htmlFor={key}
              >
                <span className="font-medium">{definition.label}</span>
                <span className="max-w-2xl text-sm leading-5 text-muted-foreground">
                  {definition.description}
                </span>
              </label>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                  {enabled ? (
                    <Eye className="size-4" aria-hidden />
                  ) : (
                    <EyeOff className="size-4" aria-hidden />
                  )}
                  {enabled ? "Visible" : "Hidden"}
                </span>
                <Switch
                  id={key}
                  checked={enabled}
                  disabled={!isConfigured || pendingKey !== null}
                  aria-label={`Show ${definition.label} on the public website`}
                  aria-busy={isPending}
                  onCheckedChange={(checked) => updateFlag(key, checked)}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
