import { useEffect } from "react";

const SITE_NAME = "Kun Khmer";
const DEFAULT_TITLE = `${SITE_NAME} — Official Platform`;

interface PageMeta {
  title?: string | null;
  description?: string | null;
  /** Absolute or root-relative image URL for link previews. Data URIs are ignored. */
  image?: string | null;
  type?: "website" | "article" | "profile";
}

function setMeta(attr: "name" | "property", key: string, content: string | null | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) return;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function absolute(url: string): string {
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
}

// The values index.html ships with, restored when a page doesn't provide its own.
const defaults = {
  description: () => document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.dataset.default,
  image: () => document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.dataset.default,
};

function rememberDefaults() {
  for (const sel of ['meta[name="description"]', 'meta[property="og:image"]']) {
    const el = document.head.querySelector<HTMLMetaElement>(sel);
    if (el && el.dataset.default === undefined) el.dataset.default = el.content;
  }
}

/**
 * Keeps <title>, the meta description and Open Graph / Twitter tags in sync with the page.
 * Search engines that run JavaScript pick these up; chat apps and Facebook read the static
 * index.html, so per-page previews there need server-side rendering of these tags.
 */
export function usePageMeta({ title, description, image, type = "website" }: PageMeta) {
  useEffect(() => {
    rememberDefaults();
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description?.trim().slice(0, 200) || defaults.description();
    const img = image && !image.startsWith("data:") ? absolute(image) : defaults.image();

    document.title = fullTitle;
    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", window.location.href);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("lang");
    canonical.href = url.href;
  }, [title, description, image, type]);
}

/** Sets document.title to "<title> | Kun Khmer" (or just the site name). */
export function usePageTitle(title?: string | null) {
  usePageMeta({ title });
}
