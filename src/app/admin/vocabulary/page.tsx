"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface VocabEntry {
  _id: string;
  word: string;
  partOfSpeech: string;
  letter: string;
  definitions: { number: number; meaning: string; examples: string[] }[];
}

interface VocabListResponse {
  items: VocabEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminVocabularyPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: { index: number; word: string; error: string }[];
    total: number;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const fetchVocab = useCallback(async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (search) params.set("search", search);
    if (letter) params.set("letter", letter);

    try {
      const res = await fetch(`/api/vocabulary?${params}`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.data.items);
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
  }, [page, search, letter]);

  useEffect(() => {
    fetchVocab();
  }, [fetchVocab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVocab();
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/vocabulary/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirm(null);
        fetchVocab();
      } else {
        setError(data.error?.message || "删除失败");
      }
    } catch {
      setError("网络错误");
    }
  };

  const handleDeleteAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/vocabulary/all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeleteAllConfirm(false);
        fetchVocab();
      } else {
        setError(data.error?.message || "删除失败");
      }
    } catch {
      setError("网络错误");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Support both array format and { data: [...] } format
      const data = Array.isArray(jsonData) ? jsonData : jsonData.data;
      if (!Array.isArray(data)) {
        setError("JSON 格式错误：需要数组或 { data: [...] } 格式");
        return;
      }

      const res = await fetch("/api/vocabulary/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
      });

      const result = await res.json();
      if (result.success) {
        setImportResult(result.data);
        fetchVocab();
      } else {
        setError(result.error?.message || "导入失败");
      }
    } catch {
      setError("文件读取失败，请确认 JSON 格式正确");
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">词汇管理</h1>
        <Link
          href="/admin/vocabulary/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          添加词汇
        </Link>
      </div>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-lg p-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            ✕
          </button>
        </div>
      )}

      {importResult && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 rounded-lg p-4 text-sm">
          <p className="text-green-700 font-medium">
            导入完成：共 {importResult.total} 条，成功 {importResult.imported} 条
          </p>
          {importResult.errors.length > 0 && (
            <div className="mt-2 text-red-600">
              <p>失败 {importResult.errors.length} 条：</p>
              <ul className="mt-1 list-disc list-inside">
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>
                    第 {err.index + 1} 条 ({err.word}): {err.error}
                  </li>
                ))}
                {importResult.errors.length > 5 && (
                  <li>...还有 {importResult.errors.length - 5} 条错误</li>
                )}
              </ul>
            </div>
          )}
          <button
            onClick={() => setImportResult(null)}
            className="mt-2 text-green-600 hover:text-green-800 text-xs"
          >
            关闭
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索词汇或释义..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              搜索
            </button>
          </form>

          {/* Import */}
          <div className="flex gap-2">
            <label className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors cursor-pointer">
              {importing ? "导入中..." : "导入 JSON"}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                disabled={importing}
              />
            </label>
            <button
              onClick={() => setDeleteAllConfirm(true)}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 text-sm rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200"
            >
              删除全部
            </button>
          </div>
        </div>

        {/* Letter filter */}
        <div className="mt-3 flex flex-wrap gap-1">
          <button
            onClick={() => { setLetter(""); setPage(1); }}
            className={`px-2 py-1 text-xs rounded ${
              letter === "" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            全部
          </button>
          {LETTERS.map((l) => (
            <button
              key={l}
              onClick={() => { setLetter(l); setPage(1); }}
              className={`px-2 py-1 text-xs rounded ${
                letter === l ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        共 {total.toLocaleString()} 条词汇
      </div>

      {/* Vocabulary table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">加载中...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {search || letter ? "没有找到匹配的词汇" : "暂无词汇数据"}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">词汇</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">词性</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium hidden sm:table-cell">释义</th>
                <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {entries.map((entry) => (
                <tr key={entry._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{entry.word}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{entry.partOfSpeech}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {entry.definitions?.map((d) => d.meaning).join("; ") || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirm === entry._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-red-600 text-xs">确认删除？</span>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="text-red-600 text-xs font-medium hover:text-red-800"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-400 dark:text-gray-500 text-xs hover:text-gray-600 dark:hover:text-gray-400"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/vocabulary/${entry._id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(entry._id)}
                          className="text-red-500 hover:text-red-700"
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
            className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            下一页
          </button>
        </div>
      )}

      {/* Delete all confirmation modal */}
      {deleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">确认删除全部词汇？</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              此操作将删除所有 {total.toLocaleString()} 条词汇数据，且不可恢复。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteAllConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              >
                确认删除全部
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
