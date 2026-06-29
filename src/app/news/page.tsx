import { NEWS } from "@/data/news";
import { NewsFeed } from "./NewsFeed";

export default function NewsPage() {
  return <NewsFeed items={NEWS} />;
}
