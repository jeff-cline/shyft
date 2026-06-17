"use client";

/**
 * Rotating keyword cloud. Words are scattered with a phyllotaxis (sunflower) spiral so
 * the layout is deterministic (no hydration mismatch), sized by frequency (bigger = more
 * visits). The disc slowly rotates; each word counter-rotates to stay upright.
 */
export function KeywordCloud({ words }: { words: { keyword: string; count: number }[] }) {
  if (!words.length) {
    return (
      <p className="opacity-60 text-center py-16">
        No keyword traffic yet — once ads send visitors with{" "}
        <code className="bg-ink/10 px-1 rounded">?kw=…</code>, the most-used words bloom here,
        biggest = most used.
      </p>
    );
  }

  const top = words.slice(0, 28);
  const counts = top.map((w) => w.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const SIZE = 460;
  const C = SIZE / 2;
  const GOLDEN = 2.399963229728653; // radians
  const rScale = (SIZE / 2 - 50) / Math.sqrt(top.length);
  const fontRem = (c: number) => (max === min ? 1.7 : 1.0 + 2.0 * ((c - min) / (max - min)));

  return (
    <div className="relative mx-auto my-8 select-none" style={{ width: SIZE, height: SIZE }}>
      <div className="absolute inset-0 kw-ring">
        {top.map((w, i) => {
          const r = rScale * Math.sqrt(i);
          const a = i * GOLDEN;
          const x = C + r * Math.cos(a);
          const y = C + r * Math.sin(a);
          const fs = fontRem(w.count);
          return (
            <span
              key={w.keyword}
              className="absolute"
              style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
            >
              <span
                className="kw-word-rev block font-display text-brand-y whitespace-nowrap hover:text-brand-coral transition-colors cursor-default"
                style={{ fontSize: `${fs}rem`, opacity: 0.45 + 0.55 * ((fs - 1) / 2.0) }}
                title={`${w.keyword} — ${w.count} visit${w.count === 1 ? "" : "s"}`}
              >
                {w.keyword}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
