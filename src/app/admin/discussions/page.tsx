"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface DiscussionItem {
  _id: string;
  title: string;
  content: string;
  authorId: { _id: string; username: string; displayName: string } | string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

interface DiscussionListResponse {
  items: DiscussionItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminDiscussionsPage() {
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/discussions?${params}`);
      const data = await res.json();
      if (data.success) {
        setDiscussions(data.data.items);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      } else {
        setError(data.error?.message || "加载失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDiscussions();
  };

  const getToken = () => localStorage.getItem("token");

  const handleTogglePin = async (id: string, currentState: boolean) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(id);

    try {
      const res = await fetch(`/api/discussions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned: !currentState }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDiscussions();
      } else {
        setError(data.error?.message || "操作失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleLock = async (id: string, currentState: boolean) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(id);

    try {
      const res = await fetch(`/api/discussions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isLocked: !currentState }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDiscussions();
      } else {
        setError(data.error?.message || "操作失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(id);

    try {
      const res = await fetch(`/api/discussions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirm(null);
        fetchDiscussions();
      } else {
        setError(data.error?.message || "删除失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setActionLoading(null);
    }
  };

  const getAuthorName = (authorId: DiscussionItem["authorId"]) => {
    if (typeof authorId === "string") return authorId;
    return authorId?.displayName || authorId?.username || "未知用户";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">讨论管理</h1>
      </div>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            ✕
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索讨论标题或内容..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
          >
            搜索
          </button>
        </form>
      </div>

      {/* Results info */}
      <div className="text-sm text-gray-500 mb-3">
        共 {total.toLocaleString()} 条讨论
      </div>

      {/* Discussion table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {search ? "没有找到匹配的讨论" : "暂无讨论"}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">标题</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">作者</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">评论</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">浏览</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">状态</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {discussions.map((disc) => (
                <tr key={disc._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {disc.isPinned && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                          置顶
                        </span>
                      )}
                      <Link
                        href={`/discussions/${disc._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium truncate max-w-xs block"
                      >
                        {disc.title}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDate(disc.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {getAuthorName(disc.authorId)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {disc.commentCount}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {disc.viewCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {disc.isLocked && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        已锁定
                      </span>
                    )}
                    {!disc.isLocked && !disc.isPinned && (
                      <span className="text-xs text-gray-400">正常</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirm === disc._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-red-600 text-xs">确认删除？</span>
                        <button
                          onClick={() => handleDelete(disc._id)}
                          disabled={actionLoading === disc._id}
                          className="text-red-600 text-xs font-medium hover:text-red-800"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-400 text-xs hover:text-gray-600"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePin(disc._id, disc.isPinned)}
                          disabled={actionLoading === disc._id}
                          className={`text-xs hover:underline ${
                            disc.isPinned
                              ? "text-amber-600 hover:text-amber-800"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                          title={disc.isPinned ? "取消置顶" : "置顶"}
                        >
                          {disc.isPinned ? "取消置顶" : "置顶"}
                        </button>
                        <button
                          onClick={() => handleToggleLock(disc._id, disc.isLocked)}
                          disabled={actionLoading === disc._id}
                          className={`text-xs hover:underline ${
                            disc.isLocked
                              ? "text-red-500 hover:text-red-700"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                          title={disc.isLocked ? "解锁" : "锁定"}
                        >
                          {disc.isLocked ? "解锁" : "锁定"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(disc._id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
