import { firestore } from "./firebaseAdmin";

export interface BadgeDefDTO {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  criteria: string; // manual | loggedDays | streak | totalXp
  threshold: number;
  isDefault: boolean;
}

export function toBadgeDefDTO(d: any): BadgeDefDTO {
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    icon: d.icon,
    criteria: d.criteria,
    threshold: d.threshold,
    isDefault: d.isDefault,
  };
}

/**
 * Fetch all badge definitions (default + admin-created) from Firestore.
 * Returns empty array if the collection doesn't exist yet.
 */
export async function getAllBadgeDefs(): Promise<BadgeDefDTO[]> {
  try {
    const snap = await firestore.collection('badgeDefs').orderBy('isDefault', 'desc').orderBy('createdAt', 'asc').get();
    return snap.docs.map((d) => toBadgeDefDTO({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("getAllBadgeDefs: could not fetch badgeDefs collection (may not exist yet):", err);
    return [];
  }
}

/**
 * Evaluate which badges a user should earn based on their stats + all badge defs.
 * - manual badges are NOT auto-awarded (admin grants them)
 * - loggedDays: earned when totalLoggedDays >= threshold
 * - streak: earned when streak >= threshold
 * - totalXp: earned when xp >= threshold
 * Also handles the special "Earth Hero" (bestDayKg <= 5) via manual criteria.
 */
export function evaluateBadgesFromDefs(
  defs: BadgeDefDTO[],
  stats: {
    totalLoggedDays: number;
    streak: number;
    xp: number;
    bestDayKg: number | null;
  }
): string[] {
  const earned: string[] = [];
  for (const def of defs) {
    switch (def.criteria) {
      case "loggedDays":
        if (stats.totalLoggedDays >= def.threshold) earned.push(def.name);
        break;
      case "streak":
        if (stats.streak >= def.threshold) earned.push(def.name);
        break;
      case "totalXp":
        if (stats.xp >= def.threshold) earned.push(def.name);
        break;
      case "manual":
      default:
        // not auto-awarded
        break;
    }
  }
  return earned;
}

/** Icon name → lucide component map for rendering badges in the UI */
export const BADGE_ICON_MAP: Record<string, string> = {
  Sprout: "Sprout",
  Compass: "Compass",
  Sword: "Sword",
  Shield: "Shield",
  Award: "Award",
  Trophy: "Trophy",
  Star: "Star",
  Crown: "Crown",
  Medal: "Medal",
  Leaf: "Leaf",
  Flame: "Flame",
  Target: "Target",
  Heart: "Heart",
  Zap: "Zap",
  Sun: "Sun",
  Moon: "Moon",
  Globe: "Globe",
  Recycle: "Recycle",
};

export const BADGE_ICON_OPTIONS = Object.keys(BADGE_ICON_MAP);

export const BADGE_CRITERIA_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: "manual", label: "Manual", desc: "Admin grants this badge manually to users" },
  { value: "loggedDays", label: "Logged Days", desc: "Auto-award when user logs N days" },
  { value: "streak", label: "Streak", desc: "Auto-award when user reaches N-day streak" },
  { value: "totalXp", label: "Total XP", desc: "Auto-award when user reaches N XP" },
];
