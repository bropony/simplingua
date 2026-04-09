"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
}

interface UserInfo {
  username: string;
  role: string;
  userId: string;
}

export default function EditDiscussionPage() {
  const params = useParams();
  const router = useRouter();
  const discussionId = params.id as string;

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) {
          setUser(data.data);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const fetchDiscussion = useCallback(async () => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}`);
      const data = await res.json();
      if (data.success) {
        setDiscussion(data.data);
        setTitle(data.data.title);
        setContent(data.data.content);
        setTagsInput(data.data.tags.join(", "));
      }
    } catch (err) {
      console.error("Failed to fetch discussion:", err);
    } finally {
      setLoading(false);
    }
  }, [discussionId]);

  useEffect(() => {
    fetchDiscussion();
  }, [fetchDiscussion]);

  useEffect(() => {
    if (discussion && user) {
      const isOwner = discussion.authorId._id === user.userId;
      const isAdmin = user.role === "admin";
      if (!isOwner && !isAdmin) {
        router.push(`/discussions/${discussionId}`);
      }
    }
  }, [discussion, user, discussionId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || title.trim().length < 2) {
      setError("标题至少需要2个字符");
      return;
    }
    if (title.trim().length > 200) {
      setError("标题不能超过200个字符");
      return;
    }
    if (!content.trim()) {
      setError("内容不能为空");
      return;
    }

    const tags = tagsInput
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/discussions/${discussionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/discussions/${discussionId}`);
      } else {
        setError(data.error?.message || "更新失败");
      }
    } catch (err) {
      setError("网络错误，请重试");
      console.error("Failed to update discussion:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12 text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/discussions" className="hover:text-gray-700">
          讨论区
        </Link>
        <span className="mx-1">/</span>
        <Link href={`/discussions/${discussionId}`} className="hover:text-gray-700">
          {discussion?.title}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 dark:text-gray-300">编辑</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">编辑讨论</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入讨论标题"
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-400">{title.length}/200</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="支持 Markdown 格式..."
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标签
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="多个标签用逗号或空格分隔"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "保存中..." : "保存修改"}
          </button>
          <Link
            href={`/discussions/${discussionId}`}
            className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
