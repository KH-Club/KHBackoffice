import { timingSafeEqual } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const HEALTH_CHECK_TIMEOUT_MS = 5_000;
const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json",
};

type HealthStatus = "ok" | "unavailable";

function jsonResponse(
  body: {
    status: HealthStatus;
    timestamp: string;
    requestId: string;
    durationMs?: number;
    checks?: { database: HealthStatus };
  },
  status: number,
) {
  return Response.json(body, { status, headers: responseHeaders });
}

function secretsMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function isAuthorized(request: Request, cronSecret: string) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  return secretsMatch(authorization.slice("Bearer ".length), cronSecret);
}

export async function GET(request: Request) {
  const startedAt = performance.now();
  const timestamp = new Date().toISOString();
  const requestId = crypto.randomUUID();
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error(
      JSON.stringify({
        event: "health_check_configuration_error",
        requestId,
        message: "CRON_SECRET is not configured",
      }),
    );

    return jsonResponse(
      {
        status: "unavailable",
        timestamp,
        requestId,
        checks: { database: "unavailable" },
      },
      503,
    );
  }

  if (!isAuthorized(request, cronSecret)) {
    console.warn(
      JSON.stringify({ event: "health_check_unauthorized", requestId }),
    );

    return jsonResponse({ status: "unavailable", timestamp, requestId }, 401);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("camps")
      .select("id")
      .limit(1)
      .abortSignal(controller.signal);

    if (error) throw error;

    const durationMs = Math.round(performance.now() - startedAt);

    console.info(
      JSON.stringify({
        event: "health_check_succeeded",
        requestId,
        durationMs,
      }),
    );

    return jsonResponse(
      {
        status: "ok",
        timestamp,
        requestId,
        durationMs,
        checks: { database: "ok" },
      },
      200,
    );
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);

    console.error(
      JSON.stringify({
        event: "health_check_failed",
        requestId,
        durationMs,
        error:
          error instanceof Error
            ? { name: error.name, message: error.message }
            : { name: "UnknownError" },
      }),
    );

    return jsonResponse(
      {
        status: "unavailable",
        timestamp,
        requestId,
        durationMs,
        checks: { database: "unavailable" },
      },
      503,
    );
  } finally {
    clearTimeout(timeout);
  }
}
