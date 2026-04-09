import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "语法书 - 简语 Simplingua",
  description: "系统的简语语法教程，含章节目录、示例句子和全文搜索。",
};

export default function GrammarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
