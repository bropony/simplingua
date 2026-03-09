"use client";

import { useState, useEffect, useRef } from "react";
import { chatApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import Card from "@/components/ui/Card";
import type { ChatEvent, ChatEventType, ChatMessage } from "@/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [aiProvider, setAiProvider] = useState<"deepseek" | "openai" | "anthropic" | "local">("deepseek");
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Generate conversation ID on mount
    setConversationId(`conv_${Date.now()}`);
  }, []);

  const cleanupEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const connectChat = async (message: string) => {
    if (isConnected || eventSourceRef.current) return;

    cleanupEventSource();

    try {
      const token = getAccessToken();
      const url = token
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/message?token=${encodeURIComponent(token)}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/message`;

      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setIsConnected(true);
        setIsTyping(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: ChatEvent = JSON.parse(event.data);

          if (data.type === "thinking") {
            setIsTyping(true);
          } else if (data.type === "message") {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: data.content,
                timestamp: data.timestamp || new Date().toISOString(),
              },
            ]);
            setIsTyping(false);
          } else if (data.type === "done") {
            setIsTyping(false);
            cleanupEventSource();
            setIsConnected(false);
          } else if (data.type === "error") {
            setMessages((prev) => [
              ...prev,
              {
                role: "system",
                content: data.content,
                timestamp: new Date().toISOString(),
              },
            ]);
            setIsTyping(false);
            cleanupEventSource();
            setIsConnected(false);
          }
        } catch (e) {
          console.error("Failed to parse SSE event:", e);
        }
      };

      eventSource.onerror = () => {
        setIsTyping(false);
        cleanupEventSource();
        setIsConnected(false);
      };

      eventSourceRef.current = eventSource;

    } catch (error) {
      console.error("Failed to connect to chat:", error);
    }
  };

  const handleSend = () => {
    if (!input.trim() || !conversationId) return;

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessages = [...messages, userMessage];

    // Connect SSE with message via GET (EventSource compatibility)
    connectChat(input);

    // Reset input
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-simplingua-primary mb-4">
            AI Language Tutor
          </h1>
          <p className="text-gray-600">
            Chat with SimplinguaBot to learn vocabulary, grammar, and get help
          </p>
        </div>

        {/* Chat Messages */}
        <Card className="mb-4 min-h-[500px] max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <p>Start a conversation to learn Simplingua</p>
                <p className="text-sm">
                  Ask for translations, grammar explanations, or example sentences
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-simplingua-primary text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <span className="font-bold text-simplingua-secondary mr-2">
                        Bot:
                      </span>
                    )}
                    {msg.role === "user" && (
                      <span className="font-semibold text-simplingua-primary mr-2">
                        You:
                      </span>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-500">
                    <span className="inline-block animate-pulse">...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Input Area */}
        <Card className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={isConnected}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-simplingua-primary focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isConnected}
              className="px-6 py-2 bg-simplingua-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnected ? "Sending..." : "Send"}
            </button>
          </div>

          {/* AI Provider Selection */}
          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider
            </label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-simplingua-primary"
            >
              <option value="deepseek">DeepSeek (Default)</option>
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="local">Local (Ollama)</option>
            </select>
          </div>
        </Card>
      </div>
    </div>
  );
}
