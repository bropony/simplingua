import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "个人设置 - 简语 Simplingua",
  description: "管理您的简语学习平台个人资料和设置。",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
