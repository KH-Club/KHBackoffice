export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tent,
  Calendar,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Database,
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch stats (will return 0 if tables don't exist yet)
  const { count: campsCount } = await supabase
    .from("camps")
    .select("*", { count: "exact", head: true })

  const { count: eventsCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })

  const stats = [
    {
      title: "Total Camps",
      value: campsCount ?? 0,
      description: "Camps in database",
      icon: Tent,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
    },
    {
      title: "Events",
      value: eventsCount ?? 0,
      description: "Upcoming and past events",
      icon: Calendar,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-500",
    },
    {
      title: "Years Active",
      value: new Date().getFullYear() - 2001,
      description: "Since 2001",
      icon: TrendingUp,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-500",
    },
    {
      title: "Community",
      value: "500+",
      description: "Active members",
      icon: Users,
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100",
      iconBg: "bg-amber-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            Welcome to the KaiHor Backoffice admin panel.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <Link href="/camps">
            <Tent className="mr-2 h-4 w-4" />
            View All Camps
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}
            />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div
                className={`${stat.iconBg} flex h-10 w-10 items-center justify-center rounded-xl shadow-lg`}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-gray-900">
                {stat.value}
              </div>
              <p className="mt-1 text-xs text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Plus className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks you might want to do</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/camps"
              className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 transition-all hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
                  <Tent className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Manage Camps</p>
                  <p className="text-sm text-gray-500">
                    Add, edit, or remove camp records
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
            </Link>
            <Link
              href="/events"
              className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 transition-all hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-500/30">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Manage Events</p>
                  <p className="text-sm text-gray-500">
                    Create and manage upcoming events
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
            </Link>
          </CardContent>
        </Card>

        {/* Setup Checklist */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Database className="h-5 w-5 text-purple-600" />
              Setup Checklist
            </CardTitle>
            <CardDescription>
              Complete these steps to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                {
                  label: "Supabase project connected",
                  done: true,
                },
                {
                  label: "Database schema created",
                  done: (campsCount ?? 0) >= 0,
                },
                {
                  label: "Camp data imported",
                  done: (campsCount ?? 0) > 0,
                },
                {
                  label: "Admin user configured",
                  done: true,
                },
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${item.done
                        ? "bg-emerald-500 text-white"
                        : "border-2 border-gray-300 bg-white"
                      }`}
                  >
                    {item.done && (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={
                      item.done
                        ? "text-gray-900"
                        : "text-gray-500"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            {(campsCount ?? 0) === 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  <strong>Next step:</strong> Run the seed.sql script in
                  Supabase SQL Editor to import camp data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
