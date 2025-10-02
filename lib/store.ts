import { promises as fs } from "fs";
const PATH = "/tmp/news.json";

export async function readStore() {
  try { return JSON.parse(await fs.readFile(PATH, "utf8")); }
  catch { return { items: [], updatedAt: 0 }; }
}

export async function writeStore(data: any) {
  data.updatedAt = Date.now();
  await fs.writeFile(PATH, JSON.stringify(data), "utf8");
}