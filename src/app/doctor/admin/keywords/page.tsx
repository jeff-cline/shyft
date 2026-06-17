import { Shyft } from "@/components/brand/Shyft";
import { getKeywordCloud } from "@/lib/keywords";
import { KeywordCloud } from "./KeywordCloud";

export const dynamic = "force-dynamic";

export default async function KeywordsAdmin() {
  const words = await getKeywordCloud(60);
  const total = words.reduce((t, w) => t + w.count, 0);
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl mb-2">
        <Shyft>Keyword Cloud</Shyft>
      </h1>
      <p className="opacity-70 mb-6">
        Which searched keywords bring people in. Bigger = more visits.{" "}
        {total} tracked visit{total === 1 ? "" : "s"} across {words.length} keyword
        {words.length === 1 ? "" : "s"}.
      </p>

      <KeywordCloud words={words.map((w) => ({ keyword: w.keyword, count: w.count }))} />

      {words.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-2xl mb-3">
            <Shyft>Top Keywords</Shyft>
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-8">
            {words.slice(0, 20).map((w) => (
              <div
                key={w.keyword}
                className="flex justify-between border-b border-ink/10 py-1.5 text-sm"
              >
                <span>{w.keyword}</span>
                <span className="opacity-60 font-display">{w.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
