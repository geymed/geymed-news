import type { NextApiRequest, NextApiResponse } from "next";
import Parser from "rss-parser";
import { FEEDS, ALLOWED_DOMAINS, KEYWORDS } from "@/lib/feeds";
import { readStore, writeStore } from "@/lib/store";
import dayjs from "dayjs";
import { get as lev } from "fast-levenshtein";

type Item = {
  title: string; link: string; isoDate?: string;
  source: string; summary?: string;
};

const parser = new Parser();

const isRelevant = (title: string, summary: string = "") =>
  KEYWORDS.some(k => (title + " " + summary).toLowerCase().includes(k.toLowerCase()));

const domain = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return ""; }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const store = await readStore();
  const collected: Item[] = [];

  for (const feed of FEEDS) {
    try {
      const f = await parser.parseURL(feed);
      for (const it of f.items) {
        const link = it.link || "";
        const d = domain(link);
        if (!ALLOWED_DOMAINS.includes(d)) continue;

        const title = (it.title || "").trim();
        const summary = (it.contentSnippet || it.content || "").trim();
        if (!isRelevant(title, summary)) continue;

        collected.push({
          title,
          link,
          isoDate: it.isoDate || it.pubDate,
          source: d,
          summary
        });
      }
    } catch {}
  }

  const unique: Item[] = [];
  for (const it of collected.sort((a,b) => +new Date(b.isoDate || 0) - +new Date(a.isoDate || 0))) {
    if (unique.some(u => u.link === it.link)) continue;
    if (unique.some(u => lev(u.title, it.title) < 10)) continue;
    unique.push(it);
  }

  await writeStore({ items: unique.slice(0, 200) });
  res.status(200).json({ ok: true, count: unique.length, updatedAt: dayjs().toISOString() });
}