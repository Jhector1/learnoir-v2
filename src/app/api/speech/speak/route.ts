import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_SPEECH_URL = "https://api.openai.com/v1/audio/speech";

// Per OpenAI: input max length is 4096 characters. :contentReference[oaicite:2]{index=2}
const MAX_CHARS = 4096;

type Format = "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";

function contentTypeFor(format: Format) {
    switch (format) {
        case "mp3":
            return "audio/mpeg";
        case "opus":
            return "audio/ogg"; // opus is typically in an Ogg container
        case "aac":
            return "audio/aac";
        case "flac":
            return "audio/flac";
        case "wav":
            return "audio/wav";
        case "pcm":
            return "application/octet-stream";
        default:
            return "audio/mpeg";
    }
}

async function safeJson(r: Response) {
    try {
        return await r.json();
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    let body: any = null;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
    }

    const text = String(body?.text ?? body?.input ?? "").trim();
    if (!text) {
        return NextResponse.json({ error: 'Missing "text"' }, { status: 400 });
    }
    if (text.length > MAX_CHARS) {
        return NextResponse.json(
            { error: `Text too long (${text.length}). Max is ${MAX_CHARS} chars.` },
            { status: 413 }
        );
    }

    // Best-quality voices per OpenAI guide: marin / cedar. :contentReference[oaicite:3]{index=3}
    const voice = String(body?.voice ?? "marin");
    const format = (String(body?.format ?? "mp3") as Format) || "mp3";
    const speed = typeof body?.speed === "number" ? body.speed : 1.0;

    // "instructions" lets you steer delivery (works with gpt-4o-mini-tts; not with tts-1/tts-1-hd). :contentReference[oaicite:4]{index=4}
    const instructions =
        String(body?.instructions ?? "").trim() ||
        "Speak clearly in Haitian Creole (Kreyòl ayisyen), like a friendly teacher. Natural pace, slightly slow, with clear pronunciation.";

    const payload = {
        model: "gpt-4o-mini-tts",
        voice,
        input: text,
        instructions,
        response_format: format,
        speed,
    };

    const r = await fetch(OPENAI_SPEECH_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!r.ok) {
        const detail = await safeJson(r);
        return NextResponse.json(
            {
                error: "OpenAI TTS failed",
                status: r.status,
                message: detail?.error?.message ?? detail?.message ?? "Unknown error",
                detail,
            },
            { status: r.status }
        );
    }

    // The endpoint returns raw audio bytes. :contentReference[oaicite:5]{index=5}
    const arrayBuffer = await r.arrayBuffer();
    return new Response(Buffer.from(arrayBuffer), {
        status: 200,
        headers: {
            "Content-Type": contentTypeFor(format),
            "Cache-Control": "no-store",
        },
    });
}