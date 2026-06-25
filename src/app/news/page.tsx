import { NEWS } from "@/data/news";
import { getNewsRemote } from "@/data/airtable";
import { NewsFeed } from "./NewsFeed";

// Re-check often so new Airtable posts appear within a minute.
export const revalidate = 60;

export default async function NewsPage() {
  // Airtable when configured, otherwise the committed list.
  const items = (await getNewsRemote()) ?? NEWS;
  return <NewsFeed items={items} />;
}
