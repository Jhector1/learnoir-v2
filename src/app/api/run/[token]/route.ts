import { NextResponse } from "next/server";
import { pollRun } from "@/lib/code/runCode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
    _req: Request,
    ctx: { params: Promise<{ token: string }> },
) {
    try {
        const { token } = await ctx.params;
        const out = await pollRun(token);
        return NextResponse.json(out, { status: 200 });
    } catch (e: any) {
        console.error("[/api/run/[token]] failed:", e);
        return NextResponse.json(
            { ok: false, done: true, status: "Error", error: e?.message ?? "Poll failed" },
            { status: 200 },
        );
    }
}