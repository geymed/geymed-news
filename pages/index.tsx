import useSWR from "swr";
import dayjs from "dayjs";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Home() {
  const { data } = useSWR("/api/news", fetcher, { refreshInterval: 60000 });
  const items = data?.items ?? [];
  const updatedAt = data?.updatedAt ? dayjs(data.updatedAt).format("YYYY-MM-DD HH:mm:ss") : "—";

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Hamas–Trump Gaza Deal Tracker</h1>
      <p className="text-sm text-gray-600">
        Auto-updating from credible sources. Last fetch: <b>{updatedAt}</b>
      </p>

      <div className="mt-6 space-y-4">
        {items.map((it: any) => (
          <article key={it.link} className="border rounded-xl p-4">
            <div className="text-xs text-gray-500 flex gap-2">
              <span>{it.source}</span>
              <span>•</span>
              <span>{it.isoDate ? dayjs(it.isoDate).format("YYYY-MM-DD HH:mm") : "—"}</span>
            </div>
            <h2 className="text-lg font-medium mt-1">
              <a href={it.link} target="_blank" rel="noreferrer" className="underline">
                {it.title}
              </a>
            </h2>
            {it.summary && <p className="text-sm mt-1">{it.summary}</p>}
          </article>
        ))}
      </div>
    </main>
  );
}