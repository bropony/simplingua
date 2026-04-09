"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  users: number;
  admins: number;
  vocabulary: number;
  grammar: number;
  discussions: number;
  comments: number;
  recentDiscussions: {
    _id: string;
    title: string;
    commentCount: number;
    viewCount: number;
    likeCount: number;
    createdAt: string;
  }[];
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:border-blue-300 transition-colors">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
        {value.toLocaleString()}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) {
          setStats(data.data);
        } else {
          setError(data?.error?.message || "加载失败");
        }
      })
      .catch(() => setError("网络错误"));
  }, []);

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-lg p-4">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">加载中...</div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">管理仪表盘</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="注册用户" value={stats.users} />
        <StatCard label="管理员" value={stats.admins} />
        <StatCard
          label="词汇数量"
          value={stats.vocabulary}
          href="/admin/vocabulary"
        />
        <StatCard
          label="语法章节"
          value={stats.grammar}
          href="/admin/grammar"
        />
        <StatCard
          label="讨论数量"
          value={stats.discussions}
          href="/admin/discussions"
        />
        <StatCard label="评论数量" value={stats.comments} />
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-8">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          快捷操作
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/vocabulary"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            导入词汇
          </Link>
          <Link
            href="/admin/grammar"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            导入语法
          </Link>
          <Link
            href="/admin/discussions"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            管理讨论
          </Link>
        </div>
      </div>

      {/* Recent discussions */}
      {stats.recentDiscussions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            最新讨论
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {stats.recentDiscussions.map((d) => (
              <Link
                key={d._id}
                href={`/discussions/${d._id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-700 -mx-2 px-2 rounded"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {d.title}
                </span>
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-4">
                  <span>{d.viewCount} 浏览</span>
                  <span>{d.commentCount} 评论</span>
                  <span>{d.likeCount} 赞</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
