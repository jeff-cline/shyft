export interface Gift {
  number: number;
  // Shown BEFORE unlock — tease the benefit without naming the gift.
  lockedTeaser: string;
  // Shown AFTER unlock.
  title: string;
  description: string;
  url: string;
  // Brand color used for the gift box / accents.
  color: "brand-y" | "brand-coral" | "brand-teal" | "ink";
  // Button label after unlock.
  cta: string;
}

export const GIFTS: Gift[] = [
  {
    number: 1,
    lockedTeaser:
      "5 days. One small daily move. You feel the shYft by Friday.",
    title: "5-Day Bombshell Bootcamp",
    description:
      "Short, free daily prompts and one repeatable practice. By the end of the week you remember who you are.",
    url: "https://www.krystalorecrews.com/bombshellbootcamp",
    color: "brand-coral",
    cta: "Start Day 1",
  },
  {
    number: 2,
    lockedTeaser:
      "Once a week. Cameras on or off. We move through hard work together — free seat, open invitation.",
    title: "Weekly Coworking Session",
    description:
      "Drop in any week. We work in focused blocks, then check in. Co-regulation + accountability with people who get it.",
    url: "https://www.krystalorecrews.com/coworking",
    color: "brand-teal",
    cta: "Grab Your Seat",
  },
  {
    number: 3,
    lockedTeaser:
      "A tracker that doesn't shame you. One page. Five minutes a day. Real momentum.",
    title: "The Habit Tracker",
    description:
      "Printable + digital. Built for people who burned out on apps. Quietly powerful. Yours, free.",
    url: "https://www.krystalorecrews.com/habittracker",
    color: "brand-y",
    cta: "Download Tracker",
  },
  {
    number: 4,
    lockedTeaser:
      "Meditation for the woman whose brain doesn't slow down. Listen anywhere. No app, no signup.",
    title: "Just Breathe — Meditation Series",
    description:
      "A growing series of short meditations made for high performers. Stream on Spotify. New episodes regularly.",
    url: "https://open.spotify.com/show/6acctiaNwQqFy8HVuiXlN7?si=5795f2082f1a46a9",
    color: "ink",
    cta: "Listen Now",
  },
  {
    number: 5,
    lockedTeaser:
      "One live hour. May 20. Practical, not theoretical. Bring questions. Walk out shifted.",
    title: "Masterclass — May 20",
    description:
      "Save your seat. One hour, live, free. Replay sent to registered guests so you can revisit anytime.",
    url: "https://krystalore.com/masterclass",
    color: "brand-coral",
    cta: "Save My Seat",
  },
  {
    number: 6,
    lockedTeaser:
      "Three-minute quizzes that tell you something you didn't already know about yourself.",
    title: "The Quiz Library",
    description:
      "Pick any quiz. Get a custom read in three minutes. Use it to decide what to do next.",
    url: "https://krystalore.com/quizzes",
    color: "brand-teal",
    cta: "Take a Quiz",
  },
];
