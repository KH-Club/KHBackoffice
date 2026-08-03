import { timingSafeEqual } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "nodejs"

function secretsMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received)
  const expectedBuffer = Buffer.from(expected)

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  )
}

function isAuthorized(request: Request, cronSecret: string) {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) return false

  return secretsMatch(authorization.slice("Bearer ".length), cronSecret)
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error("Supabase keep-alive is not configured: CRON_SECRET is missing")
    return Response.json(
      { ok: false, error: "Keep-alive is not configured" },
      { status: 503 },
    )
  }

  if (!isAuthorized(request, cronSecret)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("keepalive")
      .select("id")
      .limit(1)

    if (error) {
      console.error("Supabase keep-alive query failed:", error)
      return Response.json(
        { ok: false, error: "Supabase keep-alive query failed" },
        { status: 503 },
      )
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error("Supabase keep-alive request failed:", error)
    return Response.json(
      { ok: false, error: "Supabase keep-alive request failed" },
      { status: 503 },
    )
  }
}
