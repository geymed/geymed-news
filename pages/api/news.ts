import type { NextApiRequest, NextApiResponse } from "next";
import { readStore } from "@/lib/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const store = await readStore();
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).json(store);
}