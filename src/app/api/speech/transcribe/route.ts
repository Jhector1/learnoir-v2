// src/app/api/speech/transcribe/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";
const MAX_BYTES = 25 * 1024 * 1024;

function safeJson(s: string) {
    try {
        return JSON.parse(s);
    } catch {
        return null;
    }
}

function pickOpenAiMessage(detail: any): string {
    return (
        detail?.error?.message ??
        detail?.message ??
        (typeof detail === "string" ? detail : null) ??
        "OpenAI returned an error."
    );
}

async function callOpenAI(form: FormData, apiKey: string) {
    const r = await fetch(OPENAI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
    });

    const text = await r.text();
    const json = safeJson(text);
    return { ok: r.ok, status: r.status, text, json };
}

function shouldTryNextModel(detail: any) {
    const msg = pickOpenAiMessage(detail).toLowerCase();

    // fall back when the model isn't available, access is missing, or params are unsupported
    return (
        msg.includes("model") ||
        msg.includes("does not exist") ||
        msg.includes("do not have access") ||
        msg.includes("unsupported") ||
        msg.includes("not supported")
    );
}

function normalizeLanguage(raw: string) {
    const s = String(raw ?? "").trim();
    const lower = s.toLowerCase();

    // Haitian Creole / Kreyòl: API currently rejects "ht" for language=...
    // so we force it via prompt and omit the language field.
    const isHaitianCreole =
        lower === "ht" || lower.startsWith("ht-") || lower === "hat";

    return { raw: s, lower, isHaitianCreole };
}

export async function POST(req: Request) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const incoming = await req.formData();

    const file = incoming.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json(
            { error: 'Expected multipart/form-data with a "file" field.' },
            { status: 400 }
        );
    }

    if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "Audio too large. Max is 25MB." }, { status: 413 });
    }

    const { raw: rawLang, isHaitianCreole } = normalizeLanguage(
        String(incoming.get("language") ?? "")
    );

    // For HT: omit language param; for others: pass through (short)
    const languageForApi = isHaitianCreole ? "" : rawLang.slice(0, 16);

    const target = String(incoming.get("target") ?? "").slice(0, 500);
    const extraPrompt = String(incoming.get("prompt") ?? "").slice(0, 1500);

    // Force language via prompt when API doesn't recognize code (HT)
    const langPrompt = isHaitianCreole
        ? "Lang: Haitian Creole / Kreyòl ayisyen. Pa tradui. Ekri ak òtograf nòmal."
        : languageForApi
            ? `Language: ${languageForApi}. Do not translate.`
            : null;

    const promptParts = [
        extraPrompt || null,
        target ? `Fraz sib: ${target}` : null,
        langPrompt,
        "Transkri sa w tande a. Pa tradui.",
    ].filter(Boolean) as string[];

    // Try best → fallback
    const modelsToTry = ["gpt-4o-transcribe", "gpt-4o-mini-transcribe", "whisper-1"];

    let lastErr: any = null;

    for (const model of modelsToTry) {
        const out = new FormData();
        out.append("file", file, file.name || "audio.webm");
        out.append("model", model);

        // gpt-4o transcribe models support json only; whisper supports json too.
        out.append("response_format", "json");
        out.append("temperature", "0");

        // Only include logprobs on gpt-4o* transcribe models
        if (model.startsWith("gpt-4o-")) out.append("include[]", "logprobs");

        // Only pass language if NOT Haitian Creole (HT currently rejected by API)
        if (languageForApi) out.append("language", languageForApi);

        if (promptParts.length) out.append("prompt", promptParts.join("\n"));

        const resp = await callOpenAI(out, apiKey);

        if (resp.ok) {
            return NextResponse.json(resp.json ?? safeJson(resp.text) ?? { text: resp.text });
        }

        lastErr = {
            model,
            status: resp.status,
            message: pickOpenAiMessage(resp.json ?? resp.text),
            detail: resp.json ?? resp.text,
            sent: {
                language: languageForApi || null,
                usedPrompt: Boolean(promptParts.length),
                fileType: file.type || null,
                fileSize: file.size,
            },
        };

        // If it's not a model/param support issue, don't keep retrying
        if (!shouldTryNextModel(resp.json ?? resp.text)) break;
    }

    return NextResponse.json(
        {
            error: "OpenAI transcription failed",
            ...lastErr,
        },
        { status: lastErr?.status ?? 400 }
    );
}