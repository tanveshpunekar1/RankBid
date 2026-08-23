/**
 * Moderation and rejection rules for disallowed listings on RankBid.
 * Disallowed categories:
 * 1. Chat / Group Invite links (WhatsApp, Telegram, Discord, Signal, Messenger)
 * 2. Gambling, betting, lottery, casino links
 * 3. Adult, NSFW, or explicit content links
 */

const DISALLOWED_CHAT_DOMAINS = [
  "chat.whatsapp.com",
  "wa.me",
  "api.whatsapp.com",
  "t.me",
  "telegram.me",
  "telegram.dog",
  "discord.gg",
  "discord.com/invite",
  "signal.group",
  "signal.me",
  "m.me",
  "messenger.com/t",
];

const DISALLOWED_GAMBLING_KEYWORDS = [
  "1xbet",
  "stake.com",
  "bet365",
  "parimatch",
  "betway",
  "dafabet",
  "casino",
  "gambling",
  "satta",
  "matka",
  "roulette",
  "slot-machine",
  "poker-real-money",
];

const DISALLOWED_ADULT_KEYWORDS = [
  "porn",
  "xxx",
  "nsfw",
  "adult",
  "onlyfans",
  "fansly",
  "camgirl",
  "escort",
  "sex",
  "xvideos",
  "redtube",
  "brazzers",
];

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  category?: "chat_invite" | "gambling" | "adult" | "invalid";
}

export function validateListingSafety(
  urlOrHandle: string,
  title?: string,
  description?: string
): ModerationResult {
  const combined = `${urlOrHandle} ${title || ""} ${description || ""}`.toLowerCase();

  // 1. Check for Chat / Community Invite Links
  for (const domain of DISALLOWED_CHAT_DOMAINS) {
    if (combined.includes(domain)) {
      return {
        allowed: false,
        reason: `Direct chat and invite links (${domain}) are not permitted. Please submit your official website, app, or public social profile instead.`,
        category: "chat_invite",
      };
    }
  }

  // 2. Check for Gambling / Betting platforms
  for (const keyword of DISALLOWED_GAMBLING_KEYWORDS) {
    if (combined.includes(keyword)) {
      return {
        allowed: false,
        reason: "Gambling, wagering, casino, or betting-related links are strictly prohibited on RankBid under Indian advertising guidelines.",
        category: "gambling",
      };
    }
  }

  // 3. Check for Adult / NSFW content
  for (const keyword of DISALLOWED_ADULT_KEYWORDS) {
    // Exact word or boundary match
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(combined)) {
      return {
        allowed: false,
        reason: "Adult, explicit, or NSFW content is strictly disallowed on RankBid.",
        category: "adult",
      };
    }
  }

  return { allowed: true };
}
