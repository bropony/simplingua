import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 - 简语 Simplingua",
  description: "登录简语学习平台。",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
