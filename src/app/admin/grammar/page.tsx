"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Section {
  title: string;
  content: string;
}

interface GrammarChapter {
  _id: string;
  chapterTitle: string;
  chapterTitleSimp?: string;
  order: number;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminGrammarPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState<GrammarChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: { index: number; chapter: string; error: string }[];
    total: number;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchChapters = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/grammar");
      const data = await res.json();
      if (data.success) {
        setChapters(data.data.chapters);
      } else {
        setError(data.error?.message || "加载失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/grammar/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirm(null);
        fetchChapters();
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
      const res = await fetch("/api/grammar/all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeleteAllConfirm(false);
        fetchChapters();
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

      const data = Array.isArray(jsonData) ? jsonData : jsonData.data;
      if (!Array.isArray(data)) {
        setError("JSON 格式错误：需要数组或 { data: [...] } 格式");
        return;
      }

      const res = await fetch("/api/grammar/import", {
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
        fetchChapters();
      } else {
        setError(result.error?.message || "导入失败");
      }
    } catch {
      setError("文件读取失败，请确认 JSON 格式正确");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">语法管理</h1>
        <Link
          href="/admin/grammar/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          添加章节
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
            导入完成：共 {importResult.total} 章，成功 {importResult.imported} 章
          </p>
          {importResult.errors.length > 0 && (
            <div className="mt-2 text-red-600">
              <p>失败 {importResult.errors.length} 章：</p>
              <ul className="mt-1 list-disc list-inside">
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>
                    第 {err.index + 1} 条 ({err.chapter}): {err.error}
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
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-2">
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
            className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-md hover:bg-red-100 transition-colors border border-red-200"
          >
            删除全部
          </button>
        </div>
      </div>

      {/* Results info */}
      <div className="text-sm text-gray-500 mb-3">
        共 {chapters.length} 个章节
      </div>

      {/* Chapters table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无语法数据</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-12">序号</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">章节标题</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">小节数</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {chapters.map((chapter) => (
                <tr key={chapter._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{chapter.order}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{chapter.chapterTitle}</div>
                    {chapter.chapterTitleSimp && (
                      <div className="text-xs text-gray-500 mt-0.5">{chapter.chapterTitleSimp}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {chapter.sections?.length || 0} 节
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirm === chapter._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-red-600 text-xs">确认删除？</span>
                        <button
                          onClick={() => handleDelete(chapter._id)}
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
                        <Link
                          href={`/admin/grammar/${chapter._id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(chapter._id)}
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

      {/* Delete all confirmation modal */}
      {deleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除全部语法？</h3>
            <p className="text-sm text-gray-600 mb-4">
              此操作将删除所有 {chapters.length} 个章节，且不可恢复。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteAllConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
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
