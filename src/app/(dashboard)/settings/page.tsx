export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createDefaultFeatureFlags,
  isFeatureFlagKey,
} from "@/lib/feature-flags";
import { FeatureFlagSettings } from "./feature-flag-settings";

export default async function SettingsPage() {
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: featureFlagRows, error: featureFlagError },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("feature_flags").select("key, enabled"),
  ]);

  const featureFlags = createDefaultFeatureFlags();

  for (const row of featureFlagRows ?? []) {
    if (isFeatureFlagKey(row.key)) {
      featureFlags[row.key] = row.enabled;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>

      {user ? (
        <FeatureFlagSettings
          initialFlags={featureFlags}
          userId={user.id}
          isConfigured={!featureFlagError}
        />
      ) : null}

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your current account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                User ID
              </p>
              <p className="font-mono text-sm">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Sign In
              </p>
              <p>
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
