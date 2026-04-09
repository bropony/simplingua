"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

const SORT_OPTIONS = [
  { value: "recent", label: "最新" },
  { value: "popular", label: "最热" },
  { value: "commented", label: "评论最多" },
];

interface DiscussionAuthor {
  _id: string;
  username: string;
  displayName?: string;
}

interface Discussion {
  _id: string;
  title: string;
  content: string;
  authorId: DiscussionAuthor;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tag, setTag] = useState("");
  const [filter, setFilter] = useState<"" | "my-discussions" | "my-comments">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) setUser(data.data.user);
      })
      .catch(() => {});
  }, []);

  const fetchDiscussions = useCallback(
    async (p: number, s: string, q: string, t: string, f: string) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("limit", "20");
        params.set("sort", s);
        if (q) params.set("search", q);
        if (t) params.set("tag", t);
        if (f === "my-discussions") params.set("author", "me");
        if (f === "my-comments") params.set("commented_by", "me");

        const headers: Record<string, string> = {};
        const token = localStorage.getItem("token");
        if (token && f) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/discussions?${params}`, { headers });
        if (!res.ok) throw new Error("请求失败");
        const data = await res.json();
        if (data.success) {
          setDiscussions(data.data.items);
          setTotal(data.data.total);
          setTotalPages(data.data.totalPages);
        } else {
          throw new Error(data.error || "加载失败");
        }
      } catch (err) {
        console.error("Failed to fetch discussions:", err);
        setError("讨论加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDiscussions(page, sort, search, tag, filter);
  }, [page, sort, search, tag, filter, fetchDiscussions]);

  const retryFetch = useCallback(() => {
    fetchDiscussions(page, sort, search, tag, filter);
  }, [fetchDiscussions, page, sort, search, tag, filter]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return `${diffMin} 分钟前`;
    if (diffHour < 24) return `${diffHour} 小时前`;
    if (diffDay < 7) return `${diffDay} 天前`;
    return date.toLocaleDateString("zh-CN");
  };

  const getContentPreview = (content: string) => {
    const plain = content.replace(/[#*`>\[\]\-]/g, "").trim();
    return plain.length > 120 ? plain.slice(0, 120) + "..." : plain;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">讨论区</h1>
          <p className="text-sm text-gray-500 mt-1">共 {total} 个讨论</p>
        </div>
        {user && (
          <Link
            href="/discussions/create"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            发起讨论
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="搜索讨论..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              清除
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {tag && (
            <button
              onClick={() => {
                setTag("");
                setPage(1);
              }}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              标签: {tag} ✕
            </button>
          )}
        </div>
      </div>

      {/* My Activity Filter */}
      {user && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setFilter(filter === "my-discussions" ? "" : "my-discussions"); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              filter === "my-discussions"
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 font-medium"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            我发起的
          </button>
          <button
            onClick={() => { setFilter(filter === "my-comments" ? "" : "my-comments"); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              filter === "my-comments"
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 font-medium"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            我评论的
          </button>
        </div>
      )}

      {/* Discussion List */}
      {loading ? (
        <LoadingSpinner text="加载讨论..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={retryFetch} />
      ) : discussions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无讨论{search || tag ? "，请尝试其他筛选条件" : "，来发起第一个讨论吧"}
        </div>
      ) : (
        <div className="grid gap-3">
          {discussions.map((discussion) => (
            <Link
              key={discussion._id}
              href={`/discussions/${discussion._id}`}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {discussion.isPinned && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                        置顶
                      </span>
                    )}
                    {discussion.isLocked && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        已锁定
                      </span>
                    )}
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {discussion.title}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {getContentPreview(discussion.content)}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span>
                      {discussion.authorId.displayName || discussion.authorId.username}
                    </span>
                    <span>{formatDate(discussion.createdAt)}</span>
                    {discussion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {discussion.tags.map((t) => (
                          <span
                            key={t}
                            onClick={(e) => {
                              e.preventDefault();
                              setTag(t);
                              setPage(1);
                            }}
                            className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center gap-1 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {discussion.likeCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {discussion.commentCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {discussion.viewCount}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
