"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import authApi from "@/lib/api";
import { setTokens } from "@/lib/auth";
import type { RegisterData } from "@/types";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    preferred_language: "en",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const response = await authApi.register(
        formData.username,
        formData.email,
        formData.password,
        formData.preferred_language
      );

      setTokens(response.tokens);
      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] flex items-center">
      <div className="max-w-md w-full mx-auto">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-simplingua-primary">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join the Simplingua learning community
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={error.includes("username") ? error : ""}
              required
              autoFocus
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={error.includes("email") ? error : ""}
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={error.includes("password") ? error : ""}
              required
              minLength={8}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-simplingua-primary focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-simplingua-primary hover:underline">
              Sign In
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-center text-sm text-gray-600">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
