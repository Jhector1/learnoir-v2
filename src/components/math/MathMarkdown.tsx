"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
// import rehypeHighlight from "rehype-highlight";

type Props = {
  content?: string;
  children?: string;
  className?: string;
  /** Use inline when rendering inside buttons/labels (no <p> wrappers). */
  inline?: boolean;
  /** Enable only if you also include a highlight.js theme AND you like the look */
  highlight?: boolean;
};

export default function MathMarkdown({
                                       content,
                                       children,
                                       className,
                                       inline = false,
                                       highlight = false,
                                     }: Props) {
  const Wrapper: React.ElementType = inline ? "span" : "div";
  const md = (typeof content === "string" ? content : typeof children === "string" ? children : "") ?? "";

  return (
      <Wrapper className={className}>
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[
              rehypeKatex,
              // ...(highlight ? ([[rehypeHighlight as any, { detect: true, ignoreMissing: true }]] as any) : []),
            ]}
            components={{
              p: ({ children }) => (inline ? <>{children}</> : <p className="my-2 leading-relaxed">{children}</p>),

              ul: ({ children }) => (inline ? <>{children}</> : <ul className="my-2 ml-5 list-disc">{children}</ul>),
              ol: ({ children }) => (inline ? <>{children}</> : <ol className="my-2 ml-5 list-decimal">{children}</ol>),
              li: ({ children }) => (inline ? <>{children}</> : <li className="my-1">{children}</li>),

              code: ({ className, children, ...props }) => {
                const isBlock = typeof className === "string" && className.includes("language-");

                // inline code
                if (!isBlock) {
                  const text =
                      typeof children === "string"
                          ? children
                          : Array.isArray(children) && typeof children[0] === "string"
                              ? children[0]
                              : children;

                  return (
                      <code
                          className="rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[0.85em] text-neutral-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/90"
                          {...props}
                      >
                        {text}
                      </code>
                  );
                }

                // fenced code block inner <code>
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
                      <pre className="ui-sketch-codeblock">
                <div className="ui-sketch-code">{children}</div>
              </pre>
                  ),
            }}
        >
          {md}
        </ReactMarkdown>
      </Wrapper>
  );
}
