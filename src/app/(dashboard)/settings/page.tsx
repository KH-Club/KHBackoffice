export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Application Settings
            </CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Additional settings will be available here, including:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Profile management</li>
              <li>Password change</li>
              <li>Notification preferences</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
