import { useEffect } from "react";

const SITE_NAME = "Kun Khmer";

/** Sets document.title to "<title> | Kun Khmer" (or just the site name). */
export function usePageTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Official Platform`;
  }, [title]);
}
