import type { QualityProfile } from "./ws";

function qualityNames(profile: QualityProfile): string[] {
  const items = profile.items ?? [];
  const names: string[] = [];
  for (const item of items) {
    const q = item.quality?.name ?? item.name;
    if (q) names.push(q);
  }
  return names;
}

export function profileSummaryLine(profile: QualityProfile): string {
  const names = qualityNames(profile);
  if (!names.length) return "";
  if (names.length === 1) return `${names[0]} only`;
  const lowest = names[0];
  const highest = names[names.length - 1];
  const cutoff = profile.cutoff?.name;
  if (cutoff) {
    return `${lowest}–${highest} · upgrades until ${cutoff}`;
  }
  return `${lowest}–${highest}`;
}