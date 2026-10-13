/** Shown while the first screen's code loads (the rest of the time the previous screen stays until the next is ready). */
export function PageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
      <div className="w-9 h-9 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
