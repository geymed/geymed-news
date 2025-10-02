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

const parser = new Parser({
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; Gaza Deal Tracker/1.0)'
  }
});

const isRelevant = (title: string, summary: string = "") => {
  const text = (title + " " + summary).toLowerCase();
  
  // Exclude clearly irrelevant topics (but be less aggressive)
  const excludeTerms = [
    "russia", "ukraine", "china", "putin", "zelensky", "moscow", "kiev", "kyiv",
    "election", "campaign", "vote", "poll", "congress", "senate", "house",
    "economy", "inflation", "stock", "market", "crypto", "bitcoin",
    "climate", "weather", "sport", "football", "basketball", "soccer",
    "entertainment", "movie", "music", "celebrity", "hollywood",
    "technology", "ai", "artificial intelligence", "tesla", "apple"
  ];
  
  // Skip if contains exclusion terms
  if (excludeTerms.some(term => text.includes(term))) {
    return false;
  }
  
  // Check for specific keyword matches first (most important)
  const hasKeywordMatch = KEYWORDS.some(k => text.includes(k.toLowerCase()));
  if (hasKeywordMatch) {
    return true;
  }
  
  // Must contain at least one geographic/political term
  const geoTerms = ["israel", "gaza", "hamas", "palestinian", "trump"];
  const hasGeoTerm = geoTerms.some(term => text.includes(term));
  
  // If it has geographic terms, also check for deal-related context
  if (hasGeoTerm) {
    const contextTerms = ["deal", "negotiat", "ceasefire", "peace", "hostage", "truce", "war", "conflict", "attack", "bomb", "missile", "rocket"];
    const hasContext = contextTerms.some(term => text.includes(term));
    return hasContext;
  }
  
  return false;
};

const domain = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return ""; }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const store = await readStore();
  const collected: Item[] = [];
  const errors: string[] = [];

  console.log(`Starting news fetch from ${FEEDS.length} feeds`);

  for (const feed of FEEDS) {
    try {
      console.log(`Fetching feed: ${feed}`);
      const f = await parser.parseURL(feed);
      console.log(`Feed ${feed} returned ${f.items?.length || 0} items`);
      
      for (const it of f.items || []) {
        const link = it.link || "";
        const d = domain(link);
        if (!ALLOWED_DOMAINS.includes(d)) {
          console.log(`Domain not allowed: ${d}`);
          continue;
        }

        const title = (it.title || "").trim();
        const summary = (it.contentSnippet || it.content || "").trim();
        if (!isRelevant(title, summary)) {
          console.log(`Filtered out: "${title}"`);
          continue;
        }
        console.log(`Included: "${title}"`);

        collected.push({
          title,
          link,
          isoDate: it.isoDate || it.pubDate,
          source: d,
          summary
        });
      }
    } catch (error) {
      const errorMsg = `Error fetching ${feed}: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  console.log(`Collected ${collected.length} relevant items`);
  console.log(`Errors: ${errors.length}`);

  const unique: Item[] = [];
  for (const it of collected.sort((a,b) => +new Date(b.isoDate || 0) - +new Date(a.isoDate || 0))) {
    if (unique.some(u => u.link === it.link)) continue;
    if (unique.some(u => lev(u.title, it.title) < 10)) continue;
    unique.push(it);
  }

  // If no items found, add a fallback message
  if (unique.length === 0) {
    unique.push({
      title: "No recent Israel-Gaza-Trump news found",
      link: "https://example.com",
      source: "system",
      summary: "The news feeds may be temporarily unavailable or no relevant news was found. Please try again later.",
      isoDate: new Date().toISOString()
    });
  }

  await writeStore({ items: unique.slice(0, 200) });
  res.status(200).json({ 
    ok: true, 
    count: unique.length, 
    updatedAt: dayjs().toISOString(),
    errors: errors.length > 0 ? errors : undefined,
    debug: {
      totalFeeds: FEEDS.length,
      totalCollected: collected.length,
      totalUnique: unique.length,
      errorCount: errors.length
    }
  });
}