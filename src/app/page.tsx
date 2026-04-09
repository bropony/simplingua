import Link from "next/link";
import connectDB from "@/lib/db";
import Discussion from "@/models/Discussion";
import User from "@/models/User";

interface HotDiscussion {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

async function getHotDiscussions(): Promise<HotDiscussion[]> {
  try {
    await connectDB();
    const discussions = await Discussion.find()
      .sort({ likeCount: -1, commentCount: -1, viewCount: -1 })
      .limit(3)
      .lean();
    return discussions as unknown as HotDiscussion[];
  } catch {
    return [];
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  return `${months} 个月前`;
}

export default async function Home() {
  const hotDiscussions = await getHotDiscussions();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          简语 Simplingua
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          学习简语 — 由路易·罗莎创建的人造语言。浏览词汇表、语法书，参与社区讨论。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/vocabulary"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            浏览词汇表
          </Link>
          <Link
            href="/grammar"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            阅读语法书
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <Link
          href="/vocabulary"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 text-lg">
            Aa
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">词汇表</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            完整的简语词汇列表，支持按字母浏览、搜索和词性筛选。
          </p>
        </Link>

        <Link
          href="/grammar"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 text-green-600 dark:text-green-400 text-lg">
            G
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">语法书</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            系统的简语语法教程，含章节目录、示例句子和全文搜索。
          </p>
        </Link>

        <Link
          href="/discussions"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400 text-lg">
            D
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">讨论区</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            与其他简语爱好者交流讨论，分享学习心得，提问解答。
          </p>
        </Link>
      </div>

      {/* Hot discussions */}
      {hotDiscussions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">热门讨论</h2>
            <Link
              href="/discussions"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              查看全部
            </Link>
          </div>
          <div className="grid gap-3">
            {hotDiscussions.map((d) => (
              <Link
                key={d._id}
                href={`/discussions/${d._id}`}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                      {d.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {d.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    <span>{d.likeCount} 赞</span>
                    <span>{d.commentCount} 评论</span>
                    <span>{timeAgo(d.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
