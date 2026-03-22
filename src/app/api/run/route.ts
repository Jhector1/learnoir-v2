import { NextResponse } from "next/server";
import { submitRun } from "@/lib/code/runCode";
import { parseRunReq } from "@/lib/code/api/parseRunReq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonNoStore(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const body = parseRunReq(raw);
    const out = await submitRun(body);

    return jsonNoStore(out, out.ok ? 200 : 502);
  } catch (e: any) {
    const message = e?.message ?? "Run submission failed";
    const badRequest =
        /must be|between|integer|Invalid|too large|Request body/i.test(message);

    console.error("[/api/run] failed:", e);

    return jsonNoStore(
        { ok: false, error: message },
        badRequest ? 400 : 500,
    );
  }
}