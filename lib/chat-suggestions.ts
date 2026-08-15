import type { Message } from "@/lib/types";

export interface SuggestionInput {
  messages: Message[];
  currentUserId: string;
  buddyFirstName: string;
}

interface SuggestionRule {
  test: (text: string) => boolean;
  options: string[];
}

// Rules are checked in order for the buddy's last message.
const BUDDY_RULES: SuggestionRule[] = [
  {
    test: (t) => /\b(thank|thanks|appreciate|grateful)\b/i.test(t),
    options: [
      "You're welcome — happy to help.",
      "No problem at all!",
      "Anytime. That's what buddies are for!",
    ],
  },
  {
    test: (t) => /\b(pray|praying|prayed|god|jesus|lord|church|service|bible|worship)\b/i.test(t),
    options: [
      "I'll be praying for you.",
      "Let me know how I can support you this week.",
      "Amen — standing with you in prayer.",
    ],
  },
  {
    test: (t) => /\b(sad|hard|tough|stress|stressed|tired|struggl|down|worry|anxious|low|overwhelmed)\b/i.test(t),
    options: [
      "Sorry to hear that — I'm here if you want to talk.",
      "Praying for you. Let me know if there's anything I can do.",
      "Take it one day at a time. You're not alone.",
    ],
  },
  {
    test: (t) => /\b(busy|work|meeting|deadline|schedule|swamped|hectic|exams|test)\b/i.test(t),
    options: [
      "That sounds full on — remember to rest.",
      "Hope things ease up soon!",
      "Let me know if you need a hand with anything.",
    ],
  },
  {
    test: (t) => /\b(weekend|saturday|sunday|tuesday|see you|coming|attend|there|church)\b/i.test(t),
    options: [
      "Sounds good — see you there!",
      "Looking forward to it!",
      "Great — I'll plan to see you this week.",
    ],
  },
  {
    test: (t) => /\b(good|great|fine|okay|ok\b|well|nice|amazing|better|happy|blessed)\b/i.test(t),
    options: [
      "Glad to hear it! What's been the best part of your week?",
      "Love to hear that!",
      "That's really good to know.",
    ],
  },
  {
    test: (t) => t.trim().endsWith("?"),
    options: [
      "Thanks for asking — I'm doing well, you?",
      "Great question! I'd say yes.",
      "Let me think about that and get back to you.",
    ],
  },
];

const BUDDY_DEFAULT = [
  "That's really nice to hear!",
  "I totally get that.",
  "How can I help?",
];

const MINE_QUESTION = [
  "No rush — whenever you get a chance.",
  "Let me know what you think 🙂",
  "Talk soon!",
];

const MINE_DEFAULT = [
  "Hope your week is going well!",
  "Let me know how you're doing.",
  "Talk soon!",
];

/**
 * Picks 2-3 suggested messages that fit the current conversation context:
 * an opener when the chat is empty, a reply that matches the buddy's last
 * message, or a gentle nudge when we're the one waiting for a reply.
 */
export function getContextualSuggestions({
  messages,
  currentUserId,
  buddyFirstName,
}: SuggestionInput): string[] {
  const first = buddyFirstName || "there";

  if (messages.length === 0) {
    return [
      `Hey ${first}! How's your week going?`,
      `Hi ${first}! Hope you're doing well.`,
      `What are you up to this week?`,
    ];
  }

  const last = messages[messages.length - 1];
  const fromBuddy = last.senderId !== currentUserId;

  if (fromBuddy) {
    for (const rule of BUDDY_RULES) {
      if (rule.test(last.message)) return rule.options;
    }
    return BUDDY_DEFAULT;
  }

  if (last.message.trim().endsWith("?")) return MINE_QUESTION;
  return MINE_DEFAULT;
}
