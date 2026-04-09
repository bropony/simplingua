"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  settings: { language: string; theme: string };
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [displayName, setDisplayName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Theme
  const [theme, setTheme] = useState("light");
  const [themeSaving, setThemeSaving] = useState(false);

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
        if (data?.success) {
          const u = data.data.user;
          setUser(u);
          setDisplayName(u.displayName || "");
          // Prefer localStorage theme (may have been toggled) over server
          const stored = localStorage.getItem("theme");
          setTheme(stored || u.settings?.theme || "light");
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const getToken = () => localStorage.getItem("token");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName: displayName.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        setProfileMsg({ type: "success", text: "个人资料已更新" });
      } else {
        setProfileMsg({ type: "error", text: data.error?.message || "更新失败" });
      }
    } catch {
      setProfileMsg({ type: "error", text: "网络错误" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "两次输入的新密码不一致" });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: "error", text: "新密码长度至少8个字符" });
      return;
    }

    setPwSaving(true);
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPwMsg({ type: "success", text: "密码已修改" });
      } else {
        setPwMsg({ type: "error", text: data.error?.message || "修改失败" });
      }
    } catch {
      setPwMsg({ type: "error", text: "网络错误" });
    } finally {
      setPwSaving(false);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    // Immediately apply theme to DOM
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setThemeSaving(true);
    const token = getToken();
    if (!token) return;

    try {
      await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: { ...(user?.settings || {}), theme: newTheme },
        }),
      });
    } catch {
      // silent fail for theme toggle
    } finally {
      setThemeSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">账户设置</h1>

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">个人资料</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-20 shrink-0">用户名</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{user.username}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-20 shrink-0">邮箱</span>
            <span className="text-gray-900 dark:text-gray-100">{user.email}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-20 shrink-0">角色</span>
            <span className="text-gray-900 dark:text-gray-100">
              {user.role === "admin" ? "管理员" : "普通用户"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-20 shrink-0">注册时间</span>
            <span className="text-gray-900 dark:text-gray-100">
              {new Date(user.createdAt).toLocaleDateString("zh-CN")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            显示名称
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="设置一个显示名称..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={profileSaving}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {profileSaving ? "保存中..." : "保存"}
            </button>
          </div>
          {profileMsg && (
            <p className={`mt-2 text-sm ${profileMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {profileMsg.text}
            </p>
          )}
        </form>
      </section>

      {/* Password Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">修改密码</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              当前密码
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              新密码
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              确认新密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {pwMsg && (
            <p className={`text-sm ${pwMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {pwMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={pwSaving}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {pwSaving ? "修改中..." : "修改密码"}
          </button>
        </form>
      </section>

      {/* Preferences Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">偏好设置</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            主题
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleThemeChange("light")}
              disabled={themeSaving}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                theme === "light"
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 font-medium"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              浅色
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              disabled={themeSaving}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                theme === "dark"
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 font-medium"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              深色
            </button>
          </div>
          {themeSaving && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">保存中...</p>
          )}
        </div>
      </section>
    </div>
  );
}
