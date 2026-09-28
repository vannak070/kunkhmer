/** Tiny Markdown subset for KUNKHMER HUB answers: [text](url) links, **bold**, "- " bullets and line breaks. */
import type { ReactNode } from "react";
import { Link } from "react-router";

const LINK = "font-semibold text-[var(--kk-blue)] underline underline-offset-2";

function renderInline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      const href = m[2];
      out.push(
        href.startsWith("/") ? (
          <Link key={`${key}-${i++}`} to={href} className={LINK}>{m[1]}</Link>
        ) : /^https?:\/\//.test(href) ? (
          <a key={`${key}-${i++}`} href={href} target="_blank" rel="noopener noreferrer" className={LINK}>{m[1]}</a>
        ) : (
          m[1]
        ),
      );
    } else {
      // Bold may wrap a link, e.g. **[Event](/events/id)**.
      out.push(<strong key={`${key}-${i}`}>{renderInline(m[3], `${key}-${i++}b`)}</strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function HubMarkdown({ text }: { text: string }) {
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
