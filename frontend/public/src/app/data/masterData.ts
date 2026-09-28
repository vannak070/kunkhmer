/** Fighter page URLs: /fighters/<slug>, where the slug comes from the fighter name. */
export function getFighterSlug(fighter: { id: string; name?: string }): string {
  if (!fighter.name) return fighter.id;
  const slug = fighter.name
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '-');
  return encodeURIComponent(slug) || fighter.id;
}
