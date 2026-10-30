/**
 * Registers the fan site's service worker (claude/updates/public-site-pwa.md): production only, after the page
 * has loaded and the phone is idle, and not on a data-saving or 2G connection — so it never slows the first screen.
 */
export function registerServiceWorker() {
  if (typeof window === "undefined" || !import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return;
  const base = import.meta.env.BASE_URL;
  const register = () => navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {});
  const later = () => ("requestIdleCallback" in window ? (window as any).requestIdleCallback(register, { timeout: 5000 }) : setTimeout(register, 3000));
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later, { once: true });
}
