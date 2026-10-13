/**
 * Installable-app plumbing (claude/features/admin-pwa.md): registers the service worker after the page has
 * loaded, tells the screens when a new version is waiting or the internet is gone, and keeps the browser's
 * "install" offer until an officer asks for it. Loaded once from main.tsx so no event is missed.
 */
import { useSyncExternalStore } from "react";
import { appPath } from "../utils/basePath";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaState {
  /** A new version is installed and waiting for the officer's "Update". */
  updateReady: boolean;
  offline: boolean;
  /** Chrome / Edge / Android can show the install window. */
  canInstall: boolean;
  /** Already opened from the home screen icon. */
  installed: boolean;
}

const standalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

let state: PwaState = { updateReady: false, offline: typeof navigator !== "undefined" && navigator.onLine === false, canInstall: false, installed: standalone() };
let deferredPrompt: InstallPromptEvent | null = null;
let waiting: ServiceWorker | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function usePwa(): PwaState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

/** Opens the browser's install window (Android / Chrome / Edge). */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  set({ canInstall: false });
  return choice.outcome === "accepted";
}

/** Activates the waiting version; the page reloads when it has taken over. */
export function applyUpdate() {
  if (waiting) waiting.postMessage("SKIP_WAITING");
  else window.location.reload();
}

/** iPhone / iPad Safari has no install window: the card then explains "Share → Add to Home Screen". */
export const isIos = () =>
  typeof navigator !== "undefined" &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

function track(registration: ServiceWorkerRegistration) {
  const check = (worker: ServiceWorker | null) => {
    if (worker && navigator.serviceWorker.controller) {
      waiting = worker;
      set({ updateReady: true });
    }
  };
  check(registration.waiting);
  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    worker?.addEventListener("statechange", () => {
      if (worker.state === "installed") check(worker);
    });
  });
  // An open app (kept all day on a phone) looks for a new version every hour.
  window.setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
}

export function startPwa() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => set({ offline: false }));
  window.addEventListener("offline", () => set({ offline: true }));
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // keep it for the "Install app" button on the home screen
    deferredPrompt = e as InstallPromptEvent;
    set({ canInstall: true });
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    set({ canInstall: false, installed: true });
  });

  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  // Only after the page is ready and the phone is idle — and not on a very slow or data-saving connection —
  // so keeping the app on the device never slows the first screen down.
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return;
  const register = () =>
    navigator.serviceWorker
      .register(appPath("/sw.js"), { scope: appPath("/") })
      .then(track)
      .catch(() => {});
  const later = () => ("requestIdleCallback" in window ? (window as any).requestIdleCallback(register, { timeout: 5000 }) : setTimeout(register, 3000));
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later, { once: true });

  // The new version took over: show it. (Not on the very first install, when nothing was running before.)
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading || !hadController) return;
    reloading = true;
    window.location.reload();
  });
}
