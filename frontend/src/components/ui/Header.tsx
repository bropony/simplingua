"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-simplingua-primary">
              Simplingua
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/wiki/search"
              className={`px-3 py-2 rounded-md transition ${
                pathname?.startsWith("/wiki")
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              Wiki
            </Link>
            <Link
              href="/chat"
              className={`px-3 py-2 rounded-md transition ${
                pathname?.startsWith("/chat")
                  ? "bg-purple-50 text-purple-700"
                  : "hover:bg-gray-100"
              }`}
            >
              Chat
            </Link>
            <Link
              href="/valva/posts"
              className={`px-3 py-2 rounded-md transition ${
                pathname?.startsWith("/valva")
                  ? "bg-green-50 text-green-700"
                  : "hover:bg-gray-100"
              }`}
            >
              Forum
            </Link>
            <Link
              href="/profile/settings"
              className={`px-3 py-2 rounded-md transition ${
                pathname?.startsWith("/profile")
                  ? "bg-gray-50 text-gray-700"
                  : "hover:bg-gray-100"
              }`}
            >
              Profile
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-simplingua-primary text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 border-2 border-simplingua-primary text-simplingua-primary rounded-lg hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
