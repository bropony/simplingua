"use client";

import { useState } from "react";
import wikiApi from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function WikiSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "word" | "grammar">("all");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await wikiApi.search(
        {
          query,
          type: activeTab === "all" ? undefined : activeTab,
          lang: "en",
          limit: 20,
          offset: 0,
        }
      );
      setResults(response.results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-simplingua-primary mb-4">
          Knowledge Base Search
        </h1>
        <p className="text-gray-600">
          Search words, grammar rules, and textbooks
        </p>
      </div>

      {/* Search Interface */}
      <Card className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search Simplingua knowledge base..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-simplingua-primary focus:border-transparent"
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "all"
                ? "border-b-2 border-simplingua-primary text-simplingua-primary"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("word")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "word"
                ? "border-b-2 border-simplingua-primary text-simplingua-primary"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Words
          </button>
          <button
            onClick={() => setActiveTab("grammar")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "grammar"
                ? "border-b-2 border-simplingua-primary text-simplingua-primary"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Grammar
          </button>
        </div>
      </Card>

      {/* Results */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading...
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result: any, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 mb-2">
                    {result.type}
                  </span>
                  <h3 className="text-lg font-semibold text-simplingua-primary">
                    {result.title}
                  </h3>
                </div>
                <span className="text-sm text-gray-500">
                  Relevance: {(result.relevance * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-gray-700 line-clamp-2">
                {result.content}
              </p>
            </Card>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <Card className="py-12 text-center text-gray-500">
          No results found for "{query}"
        </Card>
      )}

      {!query && !loading && (
        <Card className="py-12 text-center text-gray-500">
          Enter a search term to explore the Simplingua knowledge base
        </Card>
      )}
    </div>
  );
}
