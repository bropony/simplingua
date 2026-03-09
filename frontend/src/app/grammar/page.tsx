"use client";

import { useState, useEffect } from "react";
import { wikiApi } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface GrammarSection {
  id: string;
  name: string;
  description: string;
  level: string;
}

interface GrammarRule {
  id: string;
  section_id: string;
  subsection_id: string | null;
  rule_type: string;
  rule: string;
  example: string;
  exception: string | null;
  level: string;
}

const SECTION_NAMES: Record<string, string> = {
  nouns: "Nouns",
  determiners: "Determiners",
  pronouns: "Pronouns",
  numerals: "Numerals",
  adjectives: "Adjectives",
  adverbs: "Adverbs",
  verbs: "Verbs",
  auxiliaries: "Auxiliary Verbs",
  copulas: "Copulas",
  adpositions: "Adpositions",
  conjunctions: "Conjunctions",
  particles: "Particles",
  interjections: "Interjections",
  nominalization: "Nominalization",
  sentences: "Sentences",
  clauses: "Clauses",
  negation: "Negation",
  questions: "Questions",
  imperatives: "Imperatives",
  conditional: "Conditionals",
  passive: "Passive Voice",
  causatives: "Causatives",
  comparison: "Comparison",
  possession: "Possession",
  reflexive: "Reflexives",
  reciprocity: "Reciprocity",
  evidentiality: "Evidentiality",
};

const LEVEL_NAMES: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const SECTIONS = Object.entries(SECTION_NAMES).map(([id, name]) => ({ id, name }));

export default function GrammarPage() {
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, [selectedSection, selectedLevel]);

  const loadRules = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedSection) params.section_id = selectedSection;
      if (selectedLevel) params.level = selectedLevel;

      const data = await wikiApi.searchGrammar(params);
      setRules(data.results || []);
    } catch (error) {
      console.error("Failed to load grammar rules:", error);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-simplingua-primary mb-4">
          Grammar Reference
        </h1>
        <p className="text-gray-600">
          Complete guide to Simplingua grammar rules and patterns
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-simplingua-primary focus:border-transparent"
            >
              <option value="">All Sections</option>
              {SECTIONS.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-simplingua-primary focus:border-transparent"
            >
              <option value="">All Levels</option>
              {Object.entries(LEVEL_NAMES).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={loadRules} disabled={loading}>
              {loading ? "Loading..." : "Filter"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {rules.length} rule{rules.length !== 1 ? "s" : ""} found
      </div>

      {/* Grammar Rules List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading grammar rules...
        </div>
      ) : rules.length === 0 ? (
        <Card className="py-12 text-center text-gray-500">
          No grammar rules found. Try adjusting your filters.
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    {SECTION_NAMES[rule.section_id] || rule.section_id}
                  </span>
                  {rule.rule_type && (
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                      {rule.rule_type}
                    </span>
                  )}
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                    {LEVEL_NAMES[rule.level] || rule.level}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setExpandedRule(expandedRule === rule.id ? null : rule.id)
                  }
                >
                  {expandedRule === rule.id ? "▼" : "▶"}
                </Button>
              </div>

              <h3 className="text-xl font-semibold text-simplingua-primary mb-2">
                {rule.rule}
              </h3>

              {expandedRule === rule.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Example */}
                  {rule.example && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Example
                      </h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {rule.example}
                      </p>
                    </div>
                  )}

                  {/* Exception */}
                  {rule.exception && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Exception
                      </h4>
                      <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                        {rule.exception}
                      </p>
                    </div>
                  )}

                  {/* Subsection info */}
                  {rule.subsection_id && (
                    <div>
                      <span className="text-sm text-gray-600">
                        Subsection: {rule.subsection_id}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Quick Reference */}
      <Card className="mt-8 p-6">
        <h3 className="text-xl font-semibold text-simplingua-primary mb-4">
          Quick Reference
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SECTIONS.slice(0, 8).map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className="p-3 text-left rounded-lg border border-gray-200 hover:border-simplingua-primary hover:bg-simplingua-primary/5 transition-colors"
            >
              <div className="font-medium text-sm">{section.name}</div>
            </button>
          ))}
        </div>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => setSelectedSection("")}
        >
          View All Sections
        </Button>
      </Card>
    </div>
  );
}
