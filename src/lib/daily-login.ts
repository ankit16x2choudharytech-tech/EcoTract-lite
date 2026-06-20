import { getUserById, createOrUpdateUser } from "./firestore";
import { XP_RULES, todayStr, daysAgoStr } from "./carbon";

/**
 * Update streak & grant daily-login XP based on lastActiveDate.
 * Idempotent — if already touched today, returns the user unchanged.
 * Called on login (GET /api/profile) and on activity log save (POST /api/logs)
 * so that logging an activity also counts as "being active" for the streak.
 */
export async function touchDailyLogin(
  userId: string,
  lastActiveDate: string | null
): Promise<any | null> {
  const today = todayStr();
  const yesterday = daysAgoStr(1);

  // Already active today → no change (prevents double-award across calls)
  if (lastActiveDate === today) {
    return getUserById(userId);
  }

  let newStreak = 1;
  if (lastActiveDate === yesterday) {
    // consecutive day — increment existing streak
    const current = await getUserById(userId);
    newStreak = (current?.streak ?? 0) + 1;
  }
  // else: streak broken (or first ever login) → reset to 1

  // Bonus XP at streak milestones
  let bonus = XP_RULES.dailyLogin;
  if (newStreak === 7) bonus += XP_RULES.streak7;
  if (newStreak === 30) bonus += XP_RULES.streak30;
  if (newStreak % 7 === 0 && newStreak !== 7) bonus += XP_RULES.weeklyStreak;

  const current = await getUserById(userId);
  const updated = await createOrUpdateUser({
    id: userId,
    ...current,
    streak: newStreak,
    lastActiveDate: today,
    xp: (current?.xp ?? 0) + bonus,
  });
  return updated;
}
