
import React, { useEffect, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "strict",
  flowchart: {
    curve: "basis",
    htmlLabels: true,
  },
});

function MermaidDiagram({ chart }) {
  const reactId = useId();
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        setError(false);
        setSvg("");

        const result = await mermaid.render(
          diagramId,
          chart.trim()
        );

        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch (err) {
        console.error("Mermaid diagram error:", err);
        if (!cancelled) setError(true);
      }
    }

    if (chart.trim()) renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, diagramId]);

  if (error) {
    return (
      <pre className="lesson-diagram-error">
        {chart}
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="lesson-diagram-loading">
        Loading diagram...
      </div>
    );
  }

  return (
    <div
      className="lesson-mermaid"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default function LessonContent({ content }) {
  const text =
    typeof content === "string" ? content : "";

  if (!text.trim()) {
    return (
      <div className="lesson-empty">
        📚 Lesson content abhi available nahi hai.
      </div>
    );
  }

  const isMarkdown =
    /(^#{1,6}\s)|(^[-*]\s)|(^\d+\.\s)|(\|.*\|)|(^>\s)|(^```)/m.test(
      text
    );

  if (!isMarkdown) {
    return (
      <div className="lesson-rich-content legacy-content">
        {text}
      </div>
    );
  }

  return (
    <article className="lesson-rich-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="lesson-heading lesson-heading-1">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="lesson-heading lesson-heading-2">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="lesson-heading lesson-heading-3">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="lesson-paragraph">{children}</p>
          ),

          ul: ({ children }) => (
            <ul className="lesson-list">{children}</ul>
          ),

          ol: ({ children }) => (
            <ol className="lesson-list">{children}</ol>
          ),

          li: ({ children }) => (
            <li className="lesson-list-item">{children}</li>
          ),

          blockquote: ({ children }) => (
            <blockquote className="lesson-note">
              💡 {children}
            </blockquote>
          ),

          table: ({ children }) => (
            <div className="lesson-table-wrapper">
              <table className="lesson-table">
                {children}
              </table>
            </div>
          ),

          th: ({ children }) => <th>{children}</th>,

          td: ({ children }) => <td>{children}</td>,

          code: ({ className, children }) => {
            const isMermaid =
              className?.includes("language-mermaid");

            if (isMermaid) {
              return (
                <MermaidDiagram chart={String(children)} />
              );
            }

            return (
              <code className="lesson-code">
                {children}
              </code>
            );
          },

          pre: ({ children }) => {
            const child = React.Children.toArray(children)[0];

            if (
              React.isValidElement(child) &&
              child.type === MermaidDiagram
            ) {
              return child;
            }

            return (
              <pre className="lesson-diagram">
                {children}
              </pre>
            );
          },

          strong: ({ children }) => (
            <strong className="lesson-strong">
              {children}
            </strong>
          ),

          hr: () => (
            <hr className="lesson-divider" />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </article>
  );
}
