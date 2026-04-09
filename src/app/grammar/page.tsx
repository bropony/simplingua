"use client";

import { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

interface Example {
  simplingua: string;
  chinese: string;
  notes?: string;
}

interface Subsection {
  title: string;
  content: string;
  examples: Example[];
}

interface Section {
  title: string;
  content: string;
  examples: Example[];
  subsections: Subsection[];
}

interface ChapterSummary {
  _id: string;
  chapterTitle: string;
  chapterTitleSimp?: string;
  order: number;
  sections: { title: string }[];
}

interface ChapterFull extends ChapterSummary {
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

interface SearchResult {
  _id: string;
  chapterTitle: string;
  chapterTitleSimp?: string;
  order: number;
  sections: { title: string }[];
  score?: number;
}

export default function GrammarPage() {
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [chapter, setChapter] = useState<ChapterFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [error, setError] = useState("");
  const [chapterError, setChapterError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch chapter list
  useEffect(() => {
    async function loadChapters() {
      try {
        setError("");
        const res = await fetch("/api/grammar");
        if (!res.ok) throw new Error("请求失败");
        const data = await res.json();
        if (data.success) {
          setChapters(data.data.chapters);
          // Auto-select first chapter
          if (data.data.chapters.length > 0) {
            setSelectedOrder(data.data.chapters[0].order);
          }
        } else {
          throw new Error(data.error || "加载失败");
        }
      } catch (err) {
        console.error("Failed to load chapters:", err);
        setError("语法书加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    }
    loadChapters();
  }, []);

  // Fetch selected chapter
  const fetchChapter = useCallback(async (order: number) => {
    setChapterLoading(true);
    setChapterError("");
    try {
      const res = await fetch(`/api/grammar/${order}`);
      if (!res.ok) throw new Error("请求失败");
      const data = await res.json();
      if (data.success) {
        setChapter(data.data.chapter);
      } else {
        throw new Error(data.error || "加载失败");
      }
    } catch (err) {
      console.error("Failed to load chapter:", err);
      setChapterError("章节加载失败");
    } finally {
      setChapterLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedOrder !== null) {
      fetchChapter(selectedOrder);
      // Close sidebar on mobile after selection
      setSidebarOpen(false);
    }
  }, [selectedOrder, fetchChapter]);

  // Search
  const handleSearch = async () => {
    const q = searchInput.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/grammar/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data.results);
      }
    } catch (err) {
      console.error("Grammar search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchResults(null);
  };

  // Navigation helpers
  const currentIndex = chapters.findIndex((c) => c.order === selectedOrder);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  if (loading) {
    return <LoadingSpinner text="加载语法书..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">语法书</h1>
        <span className="text-sm text-gray-500">
          共 {chapters.length} 章
        </span>
      </div>

      <div className="flex gap-6">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-40 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        {/* Sidebar — TOC */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform lg:static lg:transform-none lg:w-64 lg:flex-shrink-0 lg:border-r-0 lg:bg-transparent lg:border-0 overflow-y-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 lg:p-0">
            <div className="flex items-center justify-between lg:mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                目录
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* In-page search */}
            <div className="mb-4">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="搜索语法内容..."
                  className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-2 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  搜索
                </button>
              </div>
              {searchResults !== null && (
                <div className="mt-2">
                  <button
                    onClick={clearSearch}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2"
                  >
                    清除搜索
                  </button>
                  {searchResults.length === 0 ? (
                    <p className="text-xs text-gray-500">未找到相关内容</p>
                  ) : (
                    <ul className="space-y-1">
                      {searchResults.map((r) => (
                        <li key={r._id}>
                          <button
                            onClick={() => {
                              setSelectedOrder(r.order);
                              clearSearch();
                            }}
                            className="text-left text-sm text-blue-600 hover:text-blue-800 hover:underline w-full"
                          >
                            第{r.order}章 {r.chapterTitle}
                            {r.chapterTitleSimp && (
                              <span className="text-gray-500">
                                {" "}
                                — {r.chapterTitleSimp}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Chapter list */}
            <nav className="space-y-0.5">
              {chapters.map((ch) => (
                <button
                  key={ch._id}
                  onClick={() => {
                    setSelectedOrder(ch.order);
                    clearSearch();
                  }}
                  className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedOrder === ch.order
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <span className="text-gray-400 mr-1">{ch.order}.</span>
                  {ch.chapterTitle}
                  {ch.chapterTitleSimp && (
                    <span className="text-gray-400 text-xs ml-1">
                      {ch.chapterTitleSimp}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {chapterLoading ? (
            <LoadingSpinner text="加载章节..." />
          ) : chapterError ? (
            <ErrorMessage message={chapterError} onRetry={() => selectedOrder !== null && fetchChapter(selectedOrder)} />
          ) : chapter ? (
            <article>
              {/* Chapter header */}
              <div className="mb-8">
                <div className="text-sm text-gray-400 mb-1">
                  第 {chapter.order} 章
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {chapter.chapterTitle}
                </h2>
                {chapter.chapterTitleSimp && (
                  <p className="text-gray-500 mt-1">
                    {chapter.chapterTitleSimp}
                  </p>
                )}
              </div>

              {/* Sections */}
              <div className="space-y-8">
                {chapter.sections.map((section, si) => (
                  <section key={si} className="scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                      {section.title}
                    </h3>

                    {/* Section content */}
                    {section.content && (
                      <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-line">
                        {section.content}
                      </div>
                    )}

                    {/* Section examples */}
                    {section.examples.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {section.examples.map((ex, ei) => (
                          <ExampleSentence
                            key={ei}
                            simplingua={ex.simplingua}
                            chinese={ex.chinese}
                            notes={ex.notes}
                          />
                        ))}
                      </div>
                    )}

                    {/* Subsections */}
                    {section.subsections.length > 0 && (
                      <div className="space-y-5 ml-4 border-l-2 border-gray-100 dark:border-gray-700 pl-4">
                        {section.subsections.map((sub, ssi) => (
                          <div key={ssi}>
                            <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                              {sub.title}
                            </h4>
                            {sub.content && (
                              <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3 whitespace-pre-line">
                                {sub.content}
                              </div>
                            )}
                            {sub.examples.length > 0 && (
                              <div className="space-y-3">
                                {sub.examples.map((ex, ei) => (
                                  <ExampleSentence
                                    key={ei}
                                    simplingua={ex.simplingua}
                                    chinese={ex.chinese}
                                    notes={ex.notes}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Prev/Next navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                {prevChapter ? (
                  <button
                    onClick={() => setSelectedOrder(prevChapter.order)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← 第{prevChapter.order}章 {prevChapter.chapterTitle}
                  </button>
                ) : (
                  <span />
                )}
                {nextChapter ? (
                  <button
                    onClick={() => setSelectedOrder(nextChapter.order)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    第{nextChapter.order}章 {nextChapter.chapterTitle} →
                  </button>
                ) : (
                  <span />
                )}
              </div>
            </article>
          ) : (
            <div className="text-center py-12 text-gray-500">
              请从左侧目录选择章节
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ExampleSentence({
  simplingua,
  chinese,
  notes,
}: {
  simplingua: string;
  chinese: string;
  notes?: string;
}) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{simplingua}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{chinese}</div>
      {notes && (
        <div className="text-xs text-gray-400 mt-1 italic">{notes}</div>
      )}
    </div>
  );
}
