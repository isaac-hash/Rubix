"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Key, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import api, { setApiKey } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKeyInput.startsWith("sk_live_")) {
      setError("Invalid API Key format. Must start with sk_live_");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // We verify the key by calling a simple endpoint (like getting merchant info)
      // Since we don't have a specific /me endpoint, we'll try to list plans
      setApiKey(apiKeyInput);
      await api.get("/plans"); // If this succeeds, the key is valid
      router.push("/");
    } catch (err: any) {
      setError("Invalid API Key. Please check and try again.");
      setApiKeyInput("");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md relative z-10 p-8 sm:p-12">
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Welcome back
            </h1>
            <p className="text-slate-400 text-sm">
              Enter your Secret API Key to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type="password"
              label="Secret API Key"
              placeholder="sk_live_..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              required
              error={error}
            />

            <Button type="submit" className="w-full h-12" isLoading={isLoading}>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline underline-offset-4">
              Create one
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
