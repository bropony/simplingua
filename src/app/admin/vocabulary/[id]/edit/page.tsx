"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Definition {
  number: number;
  meaning: string;
  verbType?: string;
  examples: string[];
}

interface VocabEntry {
  _id: string;
  word: string;
  partOfSpeech: string;
  verbType?: string;
  definitions: Definition[];
  letter: string;
  pronunciation?: { stressNote?: string; ipa?: string };
  genderForms?: { feminine?: string; masculine?: string; epicene?: string };
  relatedWords?: { word: string; type: string; partOfSpeech: string; meaning: string }[];
  compoundParts?: string[];
}

export default function EditVocabularyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [word, setWord] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [verbType, setVerbType] = useState("");
  const [definitions, setDefinitions] = useState<Definition[]>([
    { number: 1, meaning: "", examples: [""] },
  ]);

  const fetchEntry = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vocabulary/${id}`);
      const data = await res.json();
      if (data.success) {
        const entry: VocabEntry = data.data;
        setWord(entry.word);
        setPartOfSpeech(entry.partOfSpeech);
        setVerbType(entry.verbType || "");
        setDefinitions(
          entry.definitions?.length > 0
            ? entry.definitions
            : [{ number: 1, meaning: "", examples: [""] }]
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
    fetchEntry();
  }, [fetchEntry]);

  const addDefinition = () => {
    setDefinitions([
      ...definitions,
      { number: definitions.length + 1, meaning: "", examples: [""] },
    ]);
  };

  const removeDefinition = (index: number) => {
    if (definitions.length <= 1) return;
    setDefinitions(definitions.filter((_, i) => i !== index).map((d, i) => ({ ...d, number: i + 1 })));
  };

  const updateDefinition = (index: number, field: keyof Definition, value: string) => {
    setDefinitions(
      definitions.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  const updateExample = (defIndex: number, exIndex: number, value: string) => {
    setDefinitions(
      definitions.map((d, i) => {
        if (i !== defIndex) return d;
        const examples = [...d.examples];
        examples[exIndex] = value;
        return { ...d, examples };
      })
    );
  };

  const addExample = (defIndex: number) => {
    setDefinitions(
      definitions.map((d, i) =>
        i === defIndex ? { ...d, examples: [...d.examples, ""] } : d
      )
    );
  };

  const removeExample = (defIndex: number, exIndex: number) => {
    setDefinitions(
      definitions.map((d, i) => {
        if (i !== defIndex) return d;
        return { ...d, examples: d.examples.filter((_, j) => j !== exIndex) };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !partOfSpeech.trim()) {
      setError("词汇和词性为必填项");
      return;
    }

    setSaving(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const cleanedDefs = definitions
        .filter((d) => d.meaning.trim())
        .map((d) => ({
          ...d,
          examples: d.examples.filter((ex) => ex.trim()),
        }));

      const res = await fetch(`/api/vocabulary/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          word: word.trim(),
          partOfSpeech: partOfSpeech.trim(),
          verbType: verbType.trim() || undefined,
          definitions: cleanedDefs,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/vocabulary");
      } else {
        setError(data.error?.message || "更新失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-500">加载中...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/vocabulary" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          ← 返回
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">编辑词汇</h1>
      </div>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Basic fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              词汇 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              词性 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">动词类型</label>
            <input
              type="text"
              value={verbType}
              onChange={(e) => setVerbType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Definitions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">释义</h2>
            <button
              type="button"
              onClick={addDefinition}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + 添加释义
            </button>
          </div>

          {definitions.map((def, defIndex) => (
            <div
              key={defIndex}
              className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <span className="text-sm font-medium text-gray-500 mt-2">
                  {defIndex + 1}.
                </span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={def.meaning}
                    onChange={(e) => updateDefinition(defIndex, "meaning", e.target.value)}
                    placeholder="释义"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />

                  {/* Examples */}
                  <div className="ml-2">
                    <p className="text-xs text-gray-500 mb-1">例句：</p>
                    {def.examples.map((ex, exIndex) => (
                      <div key={exIndex} className="flex gap-2 mb-1">
                        <input
                          type="text"
                          value={ex}
                          onChange={(e) => updateExample(defIndex, exIndex, e.target.value)}
                          placeholder="例句"
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {def.examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExample(defIndex, exIndex)}
                            className="text-red-400 hover:text-red-600 text-sm px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addExample(defIndex)}
                      className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                    >
                      + 添加例句
                    </button>
                  </div>
                </div>
                {definitions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDefinition(defIndex)}
                    className="text-red-400 hover:text-red-600 text-sm mt-2"
                  >
                    删除
                  </button>
                )}
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
            href="/admin/vocabulary"
            className="px-6 py-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
