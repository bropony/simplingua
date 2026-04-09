"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface IExample {
  simplingua: string;
  chinese: string;
  notes: string;
}

interface ISubsection {
  title: string;
  content: string;
  examples: IExample[];
}

interface ISection {
  title: string;
  content: string;
  examples: IExample[];
  subsections: ISubsection[];
}

const emptyExample = (): IExample => ({ simplingua: "", chinese: "", notes: "" });

const emptySubsection = (): ISubsection => ({
  title: "",
  content: "",
  examples: [emptyExample()],
});

const emptySection = (): ISection => ({
  title: "",
  content: "",
  examples: [],
  subsections: [],
});

export default function EditGrammarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterTitleSimp, setChapterTitleSimp] = useState("");
  const [order, setOrder] = useState(1);
  const [sections, setSections] = useState<ISection[]>([emptySection()]);

  const fetchChapter = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/grammar/${id}`);
      const data = await res.json();
      if (data.success) {
        const ch = data.data.chapter;
        setChapterTitle(ch.chapterTitle || "");
        setChapterTitleSimp(ch.chapterTitleSimp || "");
        setOrder(ch.order || 1);
        setSections(
          ch.sections?.length > 0
            ? ch.sections.map((s: ISection) => ({
                ...s,
                examples: s.examples || [],
                subsections: (s.subsections || []).map((sub: ISubsection) => ({
                  ...sub,
                  examples: sub.examples || [],
                })),
              }))
            : [emptySection()]
        );
      } else {
        setError(data.error?.message || "加载失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChapter();
  }, [fetchChapter]);

  // --- Section helpers ---
  const addSection = () => setSections([...sections, emptySection()]);
  const removeSection = (i: number) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, idx) => idx !== i));
  };
  const updateSection = (i: number, field: keyof ISection, value: string) => {
    setSections(sections.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  // --- Example helpers ---
  const updateExamples = (
    sectionIdx: number,
    subIdx: number | null,
    examples: IExample[]
  ) => {
    setSections(
      sections.map((s, si) => {
        if (si !== sectionIdx) return s;
        if (subIdx === null) {
          return { ...s, examples };
        }
        const subsections = s.subsections.map((sub, subi) =>
          subi === subIdx ? { ...sub, examples } : sub
        );
        return { ...s, subsections };
      })
    );
  };

  const addExample = (sectionIdx: number, subIdx: number | null) => {
    const s = sections[sectionIdx];
    const current = subIdx === null ? s.examples : s.subsections[subIdx].examples;
    updateExamples(sectionIdx, subIdx, [...current, emptyExample()]);
  };

  const removeExample = (sectionIdx: number, subIdx: number | null, exIdx: number) => {
    const s = sections[sectionIdx];
    const current = subIdx === null ? s.examples : s.subsections[subIdx].examples;
    updateExamples(sectionIdx, subIdx, current.filter((_, i) => i !== exIdx));
  };

  const updateExample = (
    sectionIdx: number,
    subIdx: number | null,
    exIdx: number,
    field: keyof IExample,
    value: string
  ) => {
    const s = sections[sectionIdx];
    const current = subIdx === null ? s.examples : s.subsections[subIdx].examples;
    const updated = current.map((ex, i) =>
      i === exIdx ? { ...ex, [field]: value } : ex
    );
    updateExamples(sectionIdx, subIdx, updated);
  };

  // --- Subsection helpers ---
  const addSubsection = (sectionIdx: number) => {
    setSections(
      sections.map((s, si) =>
        si === sectionIdx
          ? { ...s, subsections: [...s.subsections, emptySubsection()] }
          : s
      )
    );
  };

  const removeSubsection = (sectionIdx: number, subIdx: number) => {
    setSections(
      sections.map((s, si) =>
        si === sectionIdx
          ? { ...s, subsections: s.subsections.filter((_, i) => i !== subIdx) }
          : s
      )
    );
  };

  const updateSubsection = (
    sectionIdx: number,
    subIdx: number,
    field: keyof ISubsection,
    value: string
  ) => {
    setSections(
      sections.map((s, si) => {
        if (si !== sectionIdx) return s;
        const subsections = s.subsections.map((sub, subi) =>
          subi === subIdx ? { ...sub, [field]: value } : sub
        );
        return { ...s, subsections };
      })
    );
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) {
      setError("章节标题为必填项");
      return;
    }

    setSaving(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const cleanSections = sections
      .filter((s) => s.title.trim() || s.content.trim())
      .map((s) => ({
        ...s,
        examples: s.examples.filter((ex) => ex.simplingua.trim() || ex.chinese.trim()),
        subsections: s.subsections
          .filter((sub) => sub.title.trim() || sub.content.trim())
          .map((sub) => ({
            ...sub,
            examples: sub.examples.filter((ex) => ex.simplingua.trim() || ex.chinese.trim()),
          })),
      }));

    try {
      const res = await fetch(`/api/grammar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapterTitle: chapterTitle.trim(),
          chapterTitleSimp: chapterTitleSimp.trim() || undefined,
          order,
          sections: cleanSections,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/grammar");
      } else {
        setError(data.error?.message || "更新失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  };

  // --- Example form component ---
  const renderExamples = (
    sectionIdx: number,
    subIdx: number | null,
    examples: IExample[]
  ) => (
    <div className="ml-4 mt-2">
      <p className="text-xs text-gray-500 mb-1">例句：</p>
      {examples.map((ex, exIdx) => (
        <div key={exIdx} className="flex gap-2 mb-1">
          <input
            type="text"
            value={ex.simplingua}
            onChange={(e) => updateExample(sectionIdx, subIdx, exIdx, "simplingua", e.target.value)}
            placeholder="简语"
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={ex.chinese}
            onChange={(e) => updateExample(sectionIdx, subIdx, exIdx, "chinese", e.target.value)}
            placeholder="中文"
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={ex.notes}
            onChange={(e) => updateExample(sectionIdx, subIdx, exIdx, "notes", e.target.value)}
            placeholder="备注"
            className="w-24 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => removeExample(sectionIdx, subIdx, exIdx)}
            className="text-red-400 hover:text-red-600 text-xs px-1"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addExample(sectionIdx, subIdx)}
        className="text-xs text-blue-500 hover:text-blue-700 mt-1"
      >
        + 添加例句
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-500">加载中...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/grammar" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          ← 返回
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">编辑语法章节</h1>
      </div>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                章节标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">简略标题</label>
              <input
                type="text"
                value={chapterTitleSimp}
                onChange={(e) => setChapterTitleSimp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                排序 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">章节内容</h2>
            <button
              type="button"
              onClick={addSection}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + 添加小节
            </button>
          </div>

          {sections.map((section, sectionIdx) => (
            <div
              key={sectionIdx}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  小节 {sectionIdx + 1}
                </h3>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIdx)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    删除小节
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(sectionIdx, "title", e.target.value)}
                  placeholder="小节标题"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(sectionIdx, "content", e.target.value)}
                  placeholder="小节内容"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Section examples */}
                {renderExamples(sectionIdx, null, section.examples)}

                {/* Subsections */}
                {section.subsections.length > 0 && (
                  <div className="ml-4 mt-3 space-y-3">
                    <p className="text-xs font-medium text-gray-500">子小节：</p>
                    {section.subsections.map((sub, subIdx) => (
                      <div
                        key={subIdx}
                        className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500">
                            子小节 {subIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSubsection(sectionIdx, subIdx)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            删除
                          </button>
                        </div>
                        <input
                          type="text"
                          value={sub.title}
                          onChange={(e) => updateSubsection(sectionIdx, subIdx, "title", e.target.value)}
                          placeholder="子小节标题"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                        />
                        <textarea
                          value={sub.content}
                          onChange={(e) => updateSubsection(sectionIdx, subIdx, "content", e.target.value)}
                          placeholder="子小节内容"
                          rows={2}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {renderExamples(sectionIdx, subIdx, sub.examples)}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => addSubsection(sectionIdx)}
                  className="text-xs text-blue-500 hover:text-blue-700 ml-4"
                >
                  + 添加子小节
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "保存修改"}
          </button>
          <Link
            href="/admin/grammar"
            className="px-6 py-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
