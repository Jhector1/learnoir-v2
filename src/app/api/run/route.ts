import { NextResponse } from "next/server";
import { submitRun, type RunReq } from "@/lib/code/runCode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RunReq;
    const out = await submitRun(body);
    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    console.error("[/api/run] failed:", e);
    return NextResponse.json(
        { ok: false, error: e?.message ?? "Run submission failed" },
        { status: 200 },
    );
  }
}