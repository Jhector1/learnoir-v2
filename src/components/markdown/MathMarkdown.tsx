"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

type Props = {
    content: string;
    className?: string;
    /** Use inline when rendering inside buttons/labels (no <p> wrappers). */
    inline?: boolean;
};

function nodeToText(node: React.ReactNode): string {
    if (node == null) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(nodeToText).join("");
    if (React.isValidElement(node)) return nodeToText(node.props.children);
    return "";
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            {...props}
        >
            <path
                d="M9 9h10v10H9V9Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M20 7L10 17l-4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function PreWithCopy({
                         children,
                         className,
                     }: {
    children: React.ReactNode;
    className?: string;
}) {
    const [copied, setCopied] = React.useState(false);

    const textToCopy = React.useMemo(() => nodeToText(children), [children]);

    async function onCopy() {
        const text = textToCopy.replace(/\n$/, ""); // common trailing newline
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers / non-secure contexts
                const ta = document.createElement("textarea");
                ta.value = text;
                ta.style.position = "fixed";
                ta.style.left = "-9999px";
                ta.style.top = "0";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }

            setCopied(true);
            window.setTimeout(() => setCopied(false), 900);
        } catch {
            // If copy fails, do nothing (silently).
        }
    }

    const preClass = [
        "overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-relaxed",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="relative  z-0 my-3 w-full">
            <button
                type="button"
                onClick={onCopy}
                className="absolute z-10 top-2 !right-2 !left-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                style={{ right: 8, left: "auto", top: 8 }} // hard guarantee
                aria-label="Copy code"
                title={copied ? "Copied" : "Copy"}
            >
                {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
            </button>

            <pre className={`${preClass} w-full pt-10`}>{children}</pre>
        </div>
    );

}

export default function MathMarkdown({ content, className, inline = false }: Props) {
    const Wrapper: React.ElementType = inline ? "span" : "div";

    return (
        <Wrapper className={className}>
            <ReactMarkdown
                // ✅ remarkGfm enables ~~~ fenced code blocks + tables + strikethrough, etc.
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[
                    rehypeKatex,
                    [rehypeHighlight, { detect: true, ignoreMissing: true }],
                ]}
                components={{
                    p: ({ children }) =>
                        inline ? (
                            <>{children}</>
                        ) : (
                            <p className="my-2 leading-relaxed text-sm text-neutral-700 dark:text-white/80">
                                {children}
                            </p>
                        ),

                    strong: ({ children }) => <strong className="font-extrabold">{children}</strong>,

                    ul: ({ children }) =>
                        inline ? (
                            <>{children}</>
                        ) : (
                            <ul className="my-2 ml-5 list-disc text-sm text-neutral-700 dark:text-white/80">
                                {children}
                            </ul>
                        ),

                    ol: ({ children }) =>
                        inline ? (
                            <>{children}</>
                        ) : (
                            <ol className="my-2 ml-5 list-decimal text-sm text-neutral-700 dark:text-white/80">
                                {children}
                            </ol>
                        ),

                    li: ({ children }) => (inline ? <>{children}</> : <li className="my-1">{children}</li>),

                    code: ({ className, children, ...props }) => {
                        const isBlock = typeof className === "string" && className.includes("language-");

                        if (!isBlock) {
                            const text =
                                typeof children === "string"
                                    ? children
                                    : Array.isArray(children) && typeof children[0] === "string"
                                        ? children[0]
                                        : children;

                            return (
                                <code
                                    className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.85em] text-white/90"
                                    {...props}
                                >
                                    {text}
                                </code>
                            );
                        }

                        // Keep highlighted output intact (rehype-highlight may inject <span> nodes).
                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },

                    pre: ({ children, className }) =>
                        inline ? <>{children}</> : <PreWithCopy className={className}>{children}</PreWithCopy>,

                    blockquote: ({ children }) => (
                        <blockquote className="my-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80">
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </Wrapper>
    );
}
