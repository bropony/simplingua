"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

interface Definition {
  number: number;
  meaning: string;
  examples: string[];
}

interface RelatedWord {
  word: string;
  type: string;
  partOfSpeech: string;
  meaning: string;
}

interface VocabEntry {
  _id: string;
  word: string;
  partOfSpeech: string;
  verbType?: string;
  definitions: Definition[];
  relatedWords: RelatedWord[];
  letter: string;
  pronunciation?: { ipa?: string; stressNote?: string };
  genderForms?: { masculine?: string; feminine?: string; neuter?: string; epicene?: string };
}

export default function WordDetailPage() {
  const params = useParams();
  const wordName = decodeURIComponent(params.word as string);

  const [entry, setEntry] = useState<VocabEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const fetchWord = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotFound(false);
    try {
      const res = await fetch(
        `/api/vocabulary?word=${encodeURIComponent(wordName)}&limit=1`
      );
      if (!res.ok) throw new Error("请求失败");
      const data = await res.json();
      if (data.success && data.data.items.length > 0) {
        setEntry(data.data.items[0]);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error("Failed to fetch word:", err);
      setError("词汇加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [wordName]);

  useEffect(() => {
    fetchWord();
  }, [fetchWord]);

  if (loading) {
    return <LoadingSpinner text="加载词汇..." />;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorMessage message={error} onRetry={fetchWord} />
      </div>
    );
  }

  if (notFound || !entry) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">未找到词汇 &ldquo;{wordName}&rdquo;</p>
          <Link href="/vocabulary" className="text-blue-600 hover:text-blue-800 text-sm">
            返回词汇表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500">
        <Link href="/vocabulary" className="hover:text-gray-700 dark:hover:text-gray-300">
          词汇表
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 dark:text-gray-300">{entry.word}</span>
      </div>

      {/* Word Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{entry.word}</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 mt-1">
            {entry.partOfSpeech}
          </span>
        </div>
        {entry.verbType && (
          <p className="text-sm text-gray-500 mt-1">{entry.verbType}</p>
        )}
        {entry.pronunciation?.ipa && (
          <p className="text-sm text-gray-500 mt-1">
            发音：{entry.pronunciation.ipa}
          </p>
        )}
      </div>

      {/* Definitions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">释义</h2>
        <div className="space-y-4">
          {entry.definitions.map((def) => (
            <div key={def.number}>
              <div className="flex items-start gap-2">
                {entry.definitions.length > 1 && (
                  <span className="text-blue-600 font-medium shrink-0">
                    {def.number}.
                  </span>
                )}
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-gray-100">{def.meaning}</p>
                  {def.examples && def.examples.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {def.examples.map((ex, i) => (
                        <p key={i} className="text-sm text-gray-500 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                          {ex}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gender Forms */}
      {entry.genderForms &&
        (entry.genderForms.masculine || entry.genderForms.feminine || entry.genderForms.neuter || entry.genderForms.epicene) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">性态形式</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {entry.genderForms.masculine && (
                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-md text-center">
                  <span className="text-xs text-gray-500">阳性</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {entry.genderForms.masculine}
                  </p>
                </div>
              )}
              {entry.genderForms.feminine && (
                <div className="px-3 py-2 bg-pink-50 dark:bg-pink-900/30 rounded-md text-center">
                  <span className="text-xs text-gray-500">阴性</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {entry.genderForms.feminine}
                  </p>
                </div>
              )}
              {entry.genderForms.neuter && (
                <div className="px-3 py-2 bg-green-50 dark:bg-green-900/30 rounded-md text-center">
                  <span className="text-xs text-gray-500">中性</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {entry.genderForms.neuter}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Related Words */}
      {entry.relatedWords && entry.relatedWords.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">相关词汇</h2>
          <div className="space-y-2">
            {entry.relatedWords.map((rw, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Link
                  href={`/vocabulary/${encodeURIComponent(rw.word)}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {rw.word}
                </Link>
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  {rw.partOfSpeech}
                </span>
                <span className="text-xs text-gray-400">{rw.type}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{rw.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/vocabulary"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          返回词汇表
        </Link>
      </div>
    </div>
  );
}
