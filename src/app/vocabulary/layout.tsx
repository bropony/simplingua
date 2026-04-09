import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "词汇表 - 简语 Simplingua",
  description: "完整的简语词汇列表，支持按字母浏览、搜索和词性筛选。",
};

export default function VocabularyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
