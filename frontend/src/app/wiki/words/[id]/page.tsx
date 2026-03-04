"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import wikiApi from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Word {
  id: string;
  word: string;
  part_of_speech: string;
  pronunciation: string | null;
  definitions: Record<string, string>;
  examples: Record<string, string[]>;
  verb_type: string | null;
  synonyms: string[];
  antonyms: string[];
  related_words: string[];
  frequency: number;
  gender_pair: string | null;
}

export default function WordDetailsPage() {
  const params = useParams();
  const wordId = params.id as string;

  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState("en");

  useEffect(() => {
    loadWord();
  }, [wordId]);

  const loadWord = async () => {
    setLoading(true);
    try {
      const data = await wikiApi.getWord(wordId);
      setWord(data);
    } catch (err: any) {
      setError(err.message || "Failed to load word details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-500">
          Loading word details...
        </div>
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="py-12 text-center text-red-600">
          {error || "Word not found"}
        </Card>
      </div>
    );
  }

  const definition = word.definitions[selectedLang] || Object.values(word.definitions)[0] || "";
  const examples = word.examples[selectedLang] || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={() => window.history.back()} variant="outline">
          ← Back to Search
        </Button>
      </div>

      {/* Word Header */}
      <Card className="mb-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-simplingua-primary mb-2">
              {word.word}
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                {word.part_of_speech}
              </span>
              {word.pronunciation && (
                <span className="text-lg text-gray-600">
                  [{word.pronunciation}]
                </span>
              )}
              {word.verb_type && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                  {word.verb_type}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Frequency</div>
            <div className="text-2xl font-semibold text-simplingua-primary">
              {word.frequency}
            </div>
          </div>
        </div>
      </Card>

      {/* Definition */}
      <Card className="mb-6 p-6">
        <h2 className="text-2xl font-semibold text-simplingua-primary mb-4">
          Definition
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          {definition}
        </p>
      </Card>

      {/* Examples */}
      {examples.length > 0 && (
        <Card className="mb-6 p-6">
          <h2 className="text-2xl font-semibold text-simplingua-primary mb-4">
            Examples
          </h2>
          <ul className="space-y-3">
            {examples.map((example, index) => (
              <li key={index} className="text-gray-700 leading-relaxed">
                <span className="text-simplingua-primary font-medium">
                  {index + 1}.
                </span>{" "}
                {example}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Related Words */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {word.synonyms.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-simplingua-primary mb-3">
              Synonyms
            </h3>
            <div className="flex flex-wrap gap-2">
              {word.synonyms.map((synonym) => (
                <span
                  key={synonym}
                  className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800"
                >
                  {synonym}
                </span>
              ))}
            </div>
          </Card>
        )}

        {word.antonyms.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-simplingua-primary mb-3">
              Antonyms
            </h3>
            <div className="flex flex-wrap gap-2">
              {word.antonyms.map((antonym) => (
                <span
                  key={antonym}
                  className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800"
                >
                  {antonym}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* More Related */}
      {word.related_words.length > 0 && (
        <Card className="mb-6 p-6">
          <h3 className="text-xl font-semibold text-simplingua-primary mb-3">
            Related Words
          </h3>
          <div className="flex flex-wrap gap-2">
            {word.related_words.map((related) => (
              <span
                key={related}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800"
              >
                {related}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Gender Pair */}
      {word.gender_pair && (
        <Card className="mb-6 p-6">
          <h3 className="text-xl font-semibold text-simplingua-primary mb-3">
            Gender Pair
          </h3>
          <p className="text-gray-700">
            <span className="font-semibold">{word.word}</span> ↔{" "}
            <span className="font-semibold text-simplingua-primary">
              {word.gender_pair}
            </span>
          </p>
        </Card>
      )}

      {/* Actions */}
      <Card className="p-6">
        <div className="flex gap-3">
          <Button variant="primary" size="lg">
            Add to Vocabulary
          </Button>
          <Button variant="outline" size="lg">
            Practice This Word
          </Button>
        </div>
      </Card>
    </div>
  );
}
