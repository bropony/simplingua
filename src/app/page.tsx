import Link from "next/link";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Vocabulary from "@/models/Vocabulary";
import Grammar from "@/models/Grammar";
import Discussion from "@/models/Discussion";

async function getStats() {
  try {
    await connectDB();
    const [users, vocabulary, grammar, discussions] = await Promise.all([
      User.countDocuments(),
      Vocabulary.countDocuments(),
      Grammar.countDocuments(),
      Discussion.countDocuments(),
    ]);
    return { users, vocabulary, grammar, discussions };
  } catch {
    return { users: 0, vocabulary: 0, grammar: 0, discussions: 0 };
  }
}

function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`;
  return n.toLocaleString();
}

export default async function Home() {
  const stats = await getStats();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          简语 Simplingua
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          学习简语 — 由路易·罗莎创建的人造语言。浏览词汇表、语法书，参与社区讨论。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCount(stats.vocabulary)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">词汇</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCount(stats.grammar)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">语法章节</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCount(stats.discussions)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">讨论</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCount(stats.users)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">用户</div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
    </main>
  );
}
