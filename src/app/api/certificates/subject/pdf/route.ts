// src/app/api/certificates/subject/pdf/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

import { hasReviewModule } from "@/lib/subjects/registry";
import { getActor, ensureGuestId, attachGuestCookie, actorKeyOf } from "@/lib/practice/actor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonErr(message: string, status = 400, detail?: any, setGuestId?: string) {
    const res = NextResponse.json({ message, detail }, { status });
    return attachGuestCookie(res, setGuestId);
}

function fmtDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getOrigin(req: Request) {
    try {
        return new URL(req.url).origin;
    } catch {
        return "";
    }
}

async function loadPublicAsset(req: Request, relPath: string): Promise<Buffer> {
    const clean = relPath.startsWith("/") ? relPath.slice(1) : relPath;
    const diskPath = path.join(process.cwd(), "public", clean);

    // 1) filesystem first (best for server-side PDF)
    if (fs.existsSync(diskPath)) {
        return await fs.promises.readFile(diskPath);
    }

    // 2) fallback: fetch from site origin
    const origin = getOrigin(req);
    if (!origin) throw new Error(`Asset not found and no origin: ${relPath}`);

    const url = `${origin}/${clean}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`Failed to fetch asset ${relPath} from ${url} (${r.status})`);
    const ab = await r.arrayBuffer();
    return Buffer.from(ab);
}

// Minimal PNG size reader (works for PNG only)
function readPngSize(buf: Buffer): { w: number; h: number } {
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (buf.length < 24) throw new Error("PNG too small");
    if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("Not a PNG");
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    return { w, h };
}

async function getCourseStatus(opts: { actorKey: string; subjectSlug: string; locale: string }) {
    const { actorKey, subjectSlug, locale } = opts;

    const subject = await prisma.practiceSubject.findUnique({
        where: { slug: subjectSlug },
        select: { id: true, slug: true, title: true },
    });
    if (!subject) return { ok: false as const, status: 404, message: "Unknown subjectSlug." };

    const dbModules = await prisma.practiceModule.findMany({
        where: { subjectId: subject.id },
        orderBy: { order: "asc" },
        select: { slug: true, title: true, order: true },
    });

    const reviewModules = dbModules.filter((m) => hasReviewModule(subjectSlug, m.slug));
    if (!reviewModules.length) {
        return { ok: false as const, status: 404, message: "No review modules for this subject." };
    }

    const progressRows = await prisma.reviewProgress.findMany({
        where: {
            actorKey,
            subjectSlug,
            locale,
            moduleId: { in: reviewModules.map((m) => m.slug) },
        },
        select: { moduleId: true, state: true, updatedAt: true },
    });

    const progressByModule = new Map(progressRows.map((r) => [r.moduleId, r as any]));

    const requireAssignment = true;

    const modules = await Promise.all(
        reviewModules.map(async (m) => {
            const row = progressByModule.get(m.slug);
            const state = (row?.state ?? null) as any;

            const moduleCompleted = Boolean(state?.moduleCompleted);

            const assignmentSessionId = state?.assignmentSessionId ? String(state.assignmentSessionId) : null;

            let assignmentCompleted = false;
            if (assignmentSessionId) {
                const sess = await prisma.practiceSession.findUnique({
                    where: { id: assignmentSessionId },
                    select: { status: true, completedAt: true },
                });
                assignmentCompleted = sess?.status === "completed";
            }

            return {
                moduleId: m.slug,
                title: m.title,
                order: m.order,
                moduleCompleted,
                assignmentSessionId,
                assignmentCompleted,
                completedAt: state?.moduleCompletedAt ?? null,
            };
        }),
    );

    const eligible = modules.every((x) => x.moduleCompleted && (!requireAssignment || x.assignmentCompleted));

    const completedAt =
        modules
            .map((m) => m.completedAt)
            .filter(Boolean)
            .sort()
            .slice(-1)[0] ??
        progressRows.map((r) => r.updatedAt.toISOString()).sort().slice(-1)[0] ??
        null;

    return { ok: true as const, subject, requireAssignment, modules, eligible, completedAt };
}

// Fit text into a box by reducing font size until it fits height (and wraps within width)
function fitTextBox(doc: PDFKit.PDFDocument, text: string, opts: {
    font: string;
    maxSize: number;
    minSize: number;
    width: number;
    maxHeight: number;
    lineGap?: number;
}) {
    const { font, maxSize, minSize, width, maxHeight, lineGap = 0 } = opts;

    for (let size = maxSize; size >= minSize; size -= 1) {
        doc.font(font).fontSize(size);
        const h = doc.heightOfString(text, { width, align: "center", lineGap });
        if (h <= maxHeight) return size;
    }
    return minSize;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const subjectSlug = (searchParams.get("subjectSlug") ?? "").trim();
    const locale = (searchParams.get("locale") ?? "en").trim();

    const actor0 = await getActor();
    const ensured = ensureGuestId(actor0);
    const actor = ensured.actor;
    const setGuestId = ensured.setGuestId;
    const actorKey = actorKeyOf(actor);

    if (!subjectSlug) return jsonErr("Missing subjectSlug.", 400, null, setGuestId);

    const status = await getCourseStatus({ actorKey, subjectSlug, locale });
    if (!status.ok) return jsonErr(status.message, status.status, { subjectSlug }, setGuestId);

    if (!status.eligible) {
        return jsonErr(
            "Not eligible for certificate.",
            403,
            { requireAssignment: status.requireAssignment, modules: status.modules },
            setGuestId,
        );
    }

    // Name on certificate
    let displayName = "Learner";
    if (actor.userId) {
        const u = await prisma.user.findUnique({
            where: { id: actor.userId },
            select: { name: true, email: true },
        });
        displayName = (u?.name || u?.email || "Learner").trim();
    } else {
        displayName = "Guest Learner";
    }

    // Upsert certificate row (issued once)
    const completedAtDate = status.completedAt ? new Date(status.completedAt) : null;

    const meta = {
        courseTitle: status.subject.title,
        requireAssignment: status.requireAssignment,
        modules: status.modules.map((m) => ({
            moduleId: m.moduleId,
            title: m.title,
            moduleCompleted: m.moduleCompleted,
            assignmentCompleted: m.assignmentCompleted,
        })),
    };

    const cert = await prisma.courseCertificate.upsert({
        where: {
            actorKey_subjectSlug_locale: {
                actorKey,
                subjectSlug: status.subject.slug,
                locale,
            },
        },
        create: {
            actorKey,
            subjectSlug: status.subject.slug,
            locale,
            completedAt: completedAtDate,
            meta,
        },
        update: {
            completedAt: completedAtDate ?? undefined,
            meta,
        },
        select: { id: true, issuedAt: true, completedAt: true },
    });

    // Assets
    const bgPng = await loadPublicAsset(req, "/certificates/certificate-bg.png");
    const { w: bgW, h: bgH } = readPngSize(bgPng);

    const interRegular = await loadPublicAsset(req, "/fonts/inter/Inter_18pt-Regular.ttf");
    const interBold = await loadPublicAsset(req, "/fonts/inter/Inter_18pt-Bold.ttf");

    // PDF page: keep standard LETTER landscape, but place image without distortion
    const doc = new PDFDocument({ size: "LETTER", layout: "landscape", margin: 0 });

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

    // Register fonts (avoids pdfkit built-in Helvetica -> fixes Helvetica.afm errors)
    doc.registerFont("Inter", interRegular);
    doc.registerFont("Inter-Bold", interBold);

    const W = doc.page.width;
    const H = doc.page.height;

    // ---- Place background with CONTAIN (no stretch). Keep the full border visible.
    const scale = Math.min(W / bgW, H / bgH);
    const imgW = bgW * scale;
    const imgH = bgH * scale;
    const imgX = (W - imgW) / 2;
    const imgY = (H - imgH) / 2;

    doc.image(bgPng, imgX, imgY, { width: imgW, height: imgH });

    // Everything below is positioned INSIDE the image rectangle:
    // Safe inset so we never collide with the decorative border
    const inset = Math.round(imgW * 0.07);
    const boxX = imgX + inset;
    const boxW = imgW - inset * 2;

    function center(text: string, y: number, font: string, size: number, color: string, opts?: { lineGap?: number }) {
        doc.fillColor(color).font(font).fontSize(size);
        doc.text(text, boxX, y, { width: boxW, align: "center", lineGap: opts?.lineGap ?? 0 });
    }

    const courseTitle = status.subject.title;
    const completionDateStr = fmtDate(status.completedAt);
    const issuedDateStr = cert.issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // Layout as percentages of image height (so it matches your background even if it changes)
    const yTitle = imgY + imgH * 0.18;
    const yCertifies = imgY + imgH * 0.33;
    const yName = imgY + imgH * 0.41;
    const yHas = imgY + imgH * 0.50;
    const yCourse = imgY + imgH * 0.58;
    const yDates = imgY + imgH * 0.73;

    // Auto-fit name + course to avoid overflow
    const nameSize = fitTextBox(doc, displayName, {
        font: "Inter-Bold",
        maxSize: 44,
        minSize: 24,
        width: boxW,
        maxHeight: imgH * 0.12, // allow wrap if needed
        lineGap: -2,
    });

    const courseSize = fitTextBox(doc, courseTitle, {
        font: "Inter-Bold",
        maxSize: 28,
        minSize: 16,
        width: boxW,
        maxHeight: imgH * 0.10, // allow 1–2 lines
        lineGap: -1,
    });

    // Colors (slightly softer than pure black to look more “print”)
    const ink = "#0F172A";
    const sub = "#334155";
    const muted = "#64748B";

    center("Certificate of Completion", yTitle, "Inter-Bold", 34, ink);
    center("This certifies that", yCertifies, "Inter", 14, sub);

    // Name
    center(displayName, yName, "Inter-Bold", nameSize, ink, { lineGap: -2 });

    center("has successfully completed the course", yHas, "Inter", 14, sub);

    // Course title (auto-fit)
    center(courseTitle, yCourse, "Inter-Bold", courseSize, ink, { lineGap: -1 });

    center(`Completion date: ${completionDateStr}`, yDates, "Inter", 13, sub);
    center(`Issued: ${issuedDateStr}`, yDates + 18, "Inter", 13, sub);

    // Footer: keep it off the seal by placing left + right, not centered
    const footY = imgY + imgH * 0.90;

    doc.fillColor(muted).font("Inter").fontSize(10);
    doc.text("Learnoir • Verified by course progress records", boxX, footY, {
        width: boxW,
        align: "left",
    });
    doc.text(`Certificate ID: ${cert.id}`, boxX, footY, {
        width: boxW,
        align: "right",
    });

    doc.end();

    const pdf = await done;
    const filename = `${status.subject.slug}-certificate.pdf`;

    const res = new NextResponse(pdf, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
        },
    });

    return attachGuestCookie(res, setGuestId);
}
