"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface UserInfo {
  username: string;
  role: string;
}

const navItems = [
  { href: "/admin", label: "仪表盘", icon: "📊" },
  { href: "/admin/vocabulary", label: "词汇管理", icon: "📖" },
  { href: "/admin/grammar", label: "语法管理", icon: "📝" },
  { href: "/admin/discussions", label: "讨论管理", icon: "💬" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.data?.user?.role === "admin") {
          setUser(data.data.user);
        } else {
          router.push("/");
        }
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 hidden md:block">
              管理后台
            </h2>
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="mt-4 hidden md:block">
            <Link
              href="/"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ← 返回前台
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
