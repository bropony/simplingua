"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!account || !password) {
      setError("请填写账号和密码");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: account.trim(), password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        window.dispatchEvent(new Event("auth-change"));
        router.push("/");
      } else {
        setError(data.error?.message || "登录失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">登录</h1>
          <p className="text-sm text-gray-500 mt-1">
            登录简语 Simplingua
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          {error && (
            <div className="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              邮箱 / 用户名
            </label>
            <input
              id="account"
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="输入邮箱或用户名"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          没有账号？{" "}
          <Link href="/register" className="text-blue-600 hover:text-blue-800">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
