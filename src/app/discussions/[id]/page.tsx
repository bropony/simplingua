"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

interface DiscussionAuthor {
  _id: string;
  username: string;
  displayName?: string;
}

interface CommentItem {
  _id: string;
  discussionId: string;
  parentId?: string;
  content: string;
  authorId: DiscussionAuthor;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
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

interface UserInfo {
  username: string;
  displayName?: string;
  role: string;
  userId: string;
}

function CommentTree({
  comments,
  parentId,
  user,
  discussionId,
  onReplyAdded,
  onReplyTo,
  replyToId,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  submittingReply,
}: {
  comments: CommentItem[];
  parentId: string | null;
  user: UserInfo | null;
  discussionId: string;
  onReplyAdded: () => void;
  onReplyTo: (commentId: string) => void;
  replyToId: string | null;
  replyContent: string;
  onReplyContentChange: (val: string) => void;
  onSubmitReply: () => void;
  submittingReply: boolean;
}) {
  const children = comments.filter((c) =>
    parentId ? c.parentId === parentId : !c.parentId
  );

  if (children.length === 0) return null;

  return (
    <div className={parentId ? "ml-6 border-l-2 border-gray-100 dark:border-gray-700 pl-4" : ""}>
      {children.map((comment) => (
        <div key={comment._id} className="mb-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {comment.authorId.displayName || comment.authorId.username}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              {user && (
                <button
                  onClick={() => onReplyTo(comment._id)}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  回复
                </button>
              )}
            </div>
            <div className="text-sm text-gray-700 prose prose-sm max-w-none">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{comment.content}</ReactMarkdown>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <LikeButton
                targetType="comment"
                targetId={comment._id}
                initialCount={comment.likeCount}
                user={user}
              />
            </div>
          </div>

          {/* Reply form for this comment */}
          {replyToId === comment._id && user && (
            <div className="mt-2 ml-6">
              <textarea
                value={replyContent}
                onChange={(e) => onReplyContentChange(e.target.value)}
                placeholder="写回复..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={onSubmitReply}
                  disabled={submittingReply || !replyContent.trim()}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReply ? "提交中..." : "回复"}
                </button>
                <button
                  onClick={() => onReplyTo(null as unknown as string)}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          <CommentTree
            comments={comments}
            parentId={comment._id}
            user={user}
            discussionId={discussionId}
            onReplyAdded={onReplyAdded}
            onReplyTo={onReplyTo}
            replyToId={replyToId}
            replyContent={replyContent}
            onReplyContentChange={onReplyContentChange}
            onSubmitReply={onSubmitReply}
            submittingReply={submittingReply}
          />
        </div>
      ))}
    </div>
  );
}

function LikeButton({
  targetType,
  targetId,
  initialCount,
  user,
}: {
  targetType: "discussion" | "comment";
  targetId: string;
  initialCount: number;
  user: UserInfo | null;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialCount);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetType, targetId }),
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.data.liked);
        setLikeCount(data.data.likeCount);
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
        liked ? "text-red-500" : ""
      }`}
    >
      <svg
        className="w-4 h-4"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {likeCount}
    </button>
  );
}

function formatDate(dateStr: string) {
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
}

export default function DiscussionThreadPage() {
  const params = useParams();
  const router = useRouter();
  const discussionId = params.id as string;

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) setUser(data.data);
      })
      .catch(() => {});
  }, []);

  const fetchDiscussion = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`/api/discussions/${discussionId}`);
      if (!res.ok) throw new Error("请求失败");
      const data = await res.json();
      if (data.success) {
        setDiscussion(data.data);
      } else {
        throw new Error(data.error || "加载失败");
      }
    } catch (err) {
      console.error("Failed to fetch discussion:", err);
      setError("讨论加载失败");
    }
  }, [discussionId]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}/comments?limit=100`);
      if (!res.ok) throw new Error("请求失败");
      const data = await res.json();
      if (data.success) {
        setComments(data.data.items);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [discussionId]);

  useEffect(() => {
    fetchDiscussion();
    fetchComments();
  }, [fetchDiscussion, fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;
    const token = localStorage.getItem("token");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        await fetchComments();
        await fetchDiscussion();
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !replyToId || !user) return;
    const token = localStorage.getItem("token");
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent.trim(), parentId: replyToId }),
      });
      if (res.ok) {
        setReplyContent("");
        setReplyToId(null);
        await fetchComments();
        await fetchDiscussion();
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !discussion) return;
    if (!confirm("确定要删除此讨论吗？此操作不可撤销。")) return;
    const token = localStorage.getItem("token");
    setDeleting(true);
    try {
      const res = await fetch(`/api/discussions/${discussionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.push("/discussions");
      }
    } catch (err) {
      console.error("Failed to delete discussion:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="加载讨论..." />;
  }

  if (error && !discussion) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorMessage message={error} onRetry={() => { fetchDiscussion(); fetchComments(); }} />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12 text-gray-500">
          讨论不存在
          <Link href="/discussions" className="text-blue-600 hover:underline ml-2">
            返回讨论区
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && discussion.authorId._id === user.userId;
  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/discussions" className="hover:text-gray-700">
          讨论区
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700">{discussion.title}</span>
      </div>

      {/* Discussion */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          {discussion.isPinned && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
              置顶
            </span>
          )}
          {discussion.isLocked && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              已锁定
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{discussion.title}</h1>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <span className="font-medium text-gray-700">
            {discussion.authorId.displayName || discussion.authorId.username}
          </span>
          <span>{formatDate(discussion.createdAt)}</span>
          {discussion.tags.length > 0 && (
            <div className="flex gap-1">
              {discussion.tags.map((t) => (
                <Link
                  key={t}
                  href={`/discussions?tag=${encodeURIComponent(t)}`}
                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs hover:bg-gray-200"
                >
                  {t}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 mb-4">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{discussion.content}</ReactMarkdown>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <LikeButton
              targetType="discussion"
              targetId={discussion._id}
              initialCount={discussion.likeCount}
              user={user}
            />
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {discussion.commentCount} 评论
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {discussion.viewCount} 浏览
            </span>
          </div>

          {(isOwner || isAdmin) && (
            <div className="flex gap-2">
              {isOwner && (
                <Link
                  href={`/discussions/${discussionId}/edit`}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  编辑
                </Link>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {deleting ? "删除中..." : "删除"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comment Form */}
      {user && !discussion.isLocked && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">发表评论</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "提交中..." : "发表评论"}
            </button>
          </div>
        </div>
      )}

      {!user && !discussion.isLocked && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-blue-600 hover:underline">
            登录
          </Link>{" "}
          后可以发表评论
        </div>
      )}

      {discussion.isLocked && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 text-center text-sm text-gray-500">
          该讨论已锁定，无法发表评论
        </div>
      )}

      {/* Comments */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          评论 ({comments.length})
        </h3>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">暂无评论</div>
      ) : (
        <CommentTree
          comments={comments}
          parentId={null}
          user={user}
          discussionId={discussionId}
          onReplyAdded={fetchComments}
          onReplyTo={(id) => {
            setReplyToId(id);
            setReplyContent("");
          }}
          replyToId={replyToId}
          replyContent={replyContent}
          onReplyContentChange={setReplyContent}
          onSubmitReply={handleSubmitReply}
          submittingReply={submittingReply}
        />
      )}
    </div>
  );
}
