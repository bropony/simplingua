"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const POS_OPTIONS = [
  { value: "", label: "全部词性" },
  { value: "名", label: "名词" },
  { value: "动", label: "动词" },
  { value: "形", label: "形容词" },
  { value: "副", label: "副词" },
  { value: "介", label: "介词" },
  { value: "连", label: "连词" },
  { value: "代", label: "代词" },
  { value: "数", label: "数词" },
  { value: "量", label: "量词" },
  { value: "叹", label: "叹词" },
  { value: "助", label: "助词" },
];

interface Definition {
  number: number;
  meaning: string;
  examples: string[];
}

interface VocabEntry {
  _id: string;
  word: string;
  partOfSpeech: string;
  verbType?: string;
  definitions: Definition[];
  relatedWords: { word: string; type: string; partOfSpeech: string; meaning: string }[];
  letter: string;
}

export default function VocabularyPage() {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [letter, setLetter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pos, setPos] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const lastFetchRef = useRef<() => void>();

  const fetchVocab = useCallback(
    async (p: number, l: string, s: string, ps: string) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("limit", "50");
        if (l) params.set("letter", l);
        if (s) params.set("search", s);
        if (ps) params.set("pos", ps);

        const res = await fetch(`/api/vocabulary?${params}`);
        if (!res.ok) throw new Error("请求失败");
        const data = await res.json();
        if (data.success) {
          setEntries(data.data.items);
          setTotal(data.data.total);
          setTotalPages(data.data.totalPages);
        } else {
          throw new Error(data.error || "加载失败");
        }
      } catch (err) {
        console.error("Failed to fetch vocabulary:", err);
        setError("词汇加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const retryFetch = useCallback(() => {
    fetchVocab(page, letter, search, pos);
  }, [fetchVocab, page, letter, search, pos]);

  useEffect(() => {
    fetchVocab(page, letter, search, pos);
  }, [page, letter, search, pos, fetchVocab]);

  const handleLetterClick = (l: string) => {
    setLetter(l === letter ? "" : l);
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePosChange = (value: string) => {
    setPos(value);
    setPage(1);
  };

  const getPosLabel = (posValue: string) => {
    const found = POS_OPTIONS.find((o) => o.value === posValue);
    return found ? found.label : posValue;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">词汇表</h1>
        <span className="text-sm text-gray-500">共 {total} 个词条</span>
      </div>

      {/* Alphabet Navigation */}
      <div className="flex flex-wrap gap-1 mb-4">
        {LETTERS.map((l) => (
          <button
            key={l}
            onClick={() => handleLetterClick(l)}
            className={`w-10 h-10 text-sm rounded-md font-medium transition-colors ${
              letter === l
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {l}
          </button>
        ))}
        {letter && (
          <button
            onClick={() => {
              setLetter("");
              setPage(1);
            }}
            className="h-10 px-3 text-sm rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            清除
          </button>
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
            placeholder="搜索词汇或释义..."
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
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              清除
            </button>
          )}
        </div>
        <select
          value={pos}
          onChange={(e) => handlePosChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {POS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Word List */}
      {loading ? (
        <LoadingSpinner text="加载词汇..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={retryFetch} />
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无词汇{letter || search || pos ? "，请尝试其他筛选条件" : ""}
        </div>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <Link
              key={entry._id}
              href={`/vocabulary/${encodeURIComponent(entry.word)}`}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {entry.word}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {getPosLabel(entry.partOfSpeech)}
                    </span>
                    {entry.verbType && (
                      <span className="text-xs text-gray-500">
                        {entry.verbType}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 break-words">
                    {entry.definitions.map((d) => (
                      <span key={d.number}>
                        {entry.definitions.length > 1 && `${d.number}. `}
                        {d.meaning}
                        {d.number < entry.definitions.length ? "；" : ""}
                      </span>
                    ))}
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
