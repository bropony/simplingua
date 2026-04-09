import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "讨论区 - 简语 Simplingua",
  description: "与简语爱好者交流讨论，分享学习心得，提问解答。",
};

export default function DiscussionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
