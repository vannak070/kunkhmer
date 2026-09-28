/**
 * Tiny Markdown subset for staff assistant answers: [text](url) links, **bold**, "- " bullets and
 * line breaks. Only admin paths (/home/...) become links; anything else shows as plain text.
 */
import type { ReactNode } from "react";
import { Link } from "react-router";

const LINK = "font-semibold text-primary underline underline-offset-2";

function renderInline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1]) {
      const href = m[2];
      out.push(href.startsWith("/home") ? <Link key={k} to={href} className={LINK}>{m[1]}</Link> : m[1]);
    } else {
      // Bold may wrap a link, e.g. **[Event](/home/events/id)**.
      out.push(<strong key={k}>{renderInline(m[3], `${k}b`)}</strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function AssistantMarkdown({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, idx) => {
        const bullet = /^\s*[-*]\s+/.test(line);
        const body = renderInline(line.replace(/^\s*[-*]\s+/, "").replace(/^#+\s*/, ""), `l${idx}`);
        if (bullet) return <p key={idx} className="pl-4 relative before:content-['•'] before:absolute before:left-0">{body}</p>;
        if (!line.trim()) return <div key={idx} className="h-2" />;
        return <p key={idx}>{body}</p>;
      })}
    </>
  );
}
