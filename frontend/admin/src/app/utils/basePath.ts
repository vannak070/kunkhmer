/** Strip trailing slash for React Router basename ("" when app is at root). */
export function getRouterBasename(): string {
  return (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
}

/** Build a full browser path including deploy base (e.g. /kunkhmer/admin/login). */
export function appPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getRouterBasename()}${normalized}`;
}
