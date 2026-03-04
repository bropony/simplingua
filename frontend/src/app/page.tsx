import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-simplingua-primary mb-4">
          Learn Simplingua
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A simple, regular constructed language for global communication.
          Comprehensive tools for vocabulary, grammar, and community interaction.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/wiki/search"
            className="px-6 py-3 bg-simplingua-primary text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Wiki
          </Link>
          <Link
            href="/chat"
            className="px-6 py-3 bg-simplingua-secondary text-white rounded-lg hover:bg-purple-700 transition"
          >
            Start Chat
          </Link>
          <Link
            href="/valva/posts"
            className="px-6 py-3 border-2 border-simplingua-primary text-simplingua-primary rounded-lg hover:bg-blue-50 transition"
          >
            Community Forum
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Comprehensive Wiki</h3>
            <p className="text-gray-600">
              Search words, grammar rules, and textbooks. Linguistic annotations and examples.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Tutor</h3>
            <p className="text-gray-600">
              Chat with an AI assistant that understands Simplingua. Get translations, explanations, and practice exercises.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Community Forum</h3>
            <p className="text-gray-600">
              Connect with other learners in the Valva forum. Ask questions, share knowledge, and discuss the language.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600">
              Track your learning progress. Vocabulary lists, grammar mastery, and personalized exercises.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔊</div>
            <h3 className="text-xl font-semibold mb-2">Audio Pronunciation</h3>
            <p className="text-gray-600">
              Listen to word pronunciations with IPA transcriptions. Learn correct pronunciation from native examples.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8">
          Language Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-simplingua-primary">21</div>
            <div className="text-gray-600">Grammar Sections</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-simplingua-secondary">28</div>
            <div className="text-gray-600">Language Rules</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-simplingua-accent">7</div>
            <div className="text-gray-600">Basic Grammar</div>
          </div>
        </div>
      </section>
    </div>
  );
}
