// VideoEmbedSketch.tsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

export type VideoProvider = "auto" | "youtube" | "vimeo" | "iframe" | "file";

export type VideoEmbedSketchProps = {
  url: string;
  provider?: VideoProvider;

  title?: string;
  captionMarkdown?: string;

  // optional UI/help panel like your sketches
  hudMarkdown?: string;

  // start time in seconds (best-effort)
  startSeconds?: number;

  // for <video>
  posterUrl?: string;
};

function isFileUrl(u: string) {
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(u);
}

function youtubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
  } catch {}
  return null;
}

function vimeoId(url: string) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last && /^\d+$/.test(last) ? last : null;
  } catch {}
  return null;
}

function buildEmbed(args: { url: string; provider: VideoProvider; startSeconds?: number }): {
  kind: "iframe" | "video";
  src: string;
} {
  const { url, provider, startSeconds } = args;
  const p = provider ?? "auto";

  if (p === "file") return { kind: "video", src: url };
  if (p === "iframe") return { kind: "iframe", src: url };

  const yid = p === "youtube" || p === "auto" ? youtubeId(url) : null;
  if (yid) {
    const start = startSeconds ? `?start=${Math.max(0, Math.floor(startSeconds))}` : "";
    return { kind: "iframe", src: `https://www.youtube.com/embed/${yid}${start}` };
  }

  const vid = p === "vimeo" || p === "auto" ? vimeoId(url) : null;
  if (vid) {
    const start = startSeconds ? `#t=${Math.max(0, Math.floor(startSeconds))}s` : "";
    return { kind: "iframe", src: `https://player.vimeo.com/video/${vid}${start}` };
  }

  if (p === "auto" && isFileUrl(url)) return { kind: "video", src: url };
  return { kind: "iframe", src: url };
}

export default function VideoEmbedSketch(props: VideoEmbedSketchProps) {
  const {
    url,
    provider = "auto",
    title = "Video",
    captionMarkdown,
    hudMarkdown,
    startSeconds,
    posterUrl,
  } = props;

  const embed = useMemo(() => buildEmbed({ url, provider, startSeconds }), [url, provider, startSeconds]);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // best-effort seek for <video>
  useEffect(() => {
    if (embed.kind !== "video") return;
    if (!startSeconds) return;
    const el = videoRef.current;
    if (!el) return;

    const t = Math.max(0, Math.floor(startSeconds));
    const onLoaded = () => {
      try {
        el.currentTime = t;
      } catch {}
    };

    el.addEventListener("loadedmetadata", onLoaded);
    return () => el.removeEventListener("loadedmetadata", onLoaded);
  }, [embed.kind, startSeconds]);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="ui-sketch-panel">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-black">{title}</div>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-extrabold text-neutral-600 hover:text-neutral-900 underline dark:text-white/60 dark:hover:text-white/80"
              >
                Open video in new tab
              </a>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-white/10 dark:bg-black/30">
            <div className="aspect-video w-full">
              {embed.kind === "iframe" ? (
                <iframe
                  className="h-full w-full"
                  src={embed.src}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  className="h-full w-full"
                  controls
                  preload="metadata"
                  poster={posterUrl}
                >
                  <source src={embed.src} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>

          {captionMarkdown ? <MathMarkdown className="ui-math mt-3" content={captionMarkdown} /> : null}
        </div>

        <div className="ui-sketch-panel">
          <MathMarkdown
            className="ui-math"
            content={
              hudMarkdown ??
              String.raw`
**Video lesson**

Watch the clip, then come back and continue the cards.
`.trim()
            }
          />
        </div>
      </div>
    </div>
  );
}
