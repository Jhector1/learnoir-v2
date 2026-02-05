

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
            inline ? <>{children}</> : <p className="my-2 leading-relaxed">{children}</p>,

          ul: ({ children }) =>
            inline ? <>{children}</> : <ul className="my-2 ml-5 list-disc">{children}</ul>,
          ol: ({ children }) =>
            inline ? <>{children}</> : <ol className="my-2 ml-5 list-decimal">{children}</ol>,
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

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          pre: ({ children }) =>
            inline ? (
              <>{children}</>
            ) : (
              <pre className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-relaxed">
                {children}
              </pre>
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Wrapper>
  );
}
