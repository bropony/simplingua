"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserInfo {
  username: string;
  displayName?: string;
  role: string;
}

export default function Header() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) setUser(data.data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  };

  useEffect(() => {
    fetchUser();
    window.addEventListener("auth-change", fetchUser);
    return () => window.removeEventListener("auth-change", fetchUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/login";
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="bg-[#001a4d] border-b border-[#002d7a] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14">
          <div className="flex items-center gap-8 flex-1">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="sm:hidden p-2 -mr-2 text-white/80 hover:text-white"
              aria-label="菜单"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <nav className="hidden sm:flex items-center gap-6 text-sm">
              <Link
                href="/vocabulary"
                className="text-white/70 hover:text-white transition-colors"
              >
                词汇
              </Link>
              <Link
                href="/grammar"
                className="text-white/70 hover:text-white transition-colors"
              >
                语法
              </Link>
              <Link
                href="/discussions"
                className="text-white/70 hover:text-white transition-colors"
              >
                讨论
              </Link>
            </nav>
          </div>

          <Link href="/" className="text-lg font-bold text-white shrink-0 px-4">
            Simplingua
          </Link>

          <div className="flex items-center gap-3 flex-1 justify-end">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{user.displayName || user.username}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50">
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          管理后台
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        设置
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        退出登录
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileNavOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 sm:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <nav className="sm:hidden relative z-10 bg-[#001a4d] border-t border-[#002d7a] px-4 py-3 space-y-1">
            <Link
              href="/vocabulary"
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              词汇
            </Link>
            <Link
              href="/grammar"
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              语法
            </Link>
            <Link
              href="/discussions"
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              讨论
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
