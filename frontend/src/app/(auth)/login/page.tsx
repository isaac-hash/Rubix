"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import api, { setApiKey } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await api.post("/auth/login", data);
      const { access_token } = response.data;
      
      // Store the JWT as our API key (the interceptor will use it as Bearer)
      setApiKey(access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed. Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b0f10]">
      <Card className="w-full max-w-md p-10 border-[#1c2021] bg-[#101415]">
        <div className="space-y-10">
          <div className="space-y-3 text-center">
            <div className="mx-auto w-12 h-12 bg-[#10b981]/10 rounded-[4px] flex items-center justify-center mb-6">
              <Lock className="h-6 w-6 text-[#10b981]" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Merchant Login
            </h1>
            <p className="text-[#86948a] text-sm">
              Enter your credentials to access the infrastructure.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              name="email"
              type="email"
              label="Administrator Email"
              placeholder="admin@acme.io"
              required
              className="bg-[#0b0f10]"
            />

            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              required
              className="bg-[#0b0f10]"
            />

            {error && <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">{error}</p>}

            <Button type="submit" className="w-full h-12" isLoading={isLoading}>
              Authenticate Session
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="pt-6 border-t border-[#1c2021] space-y-4">
            <p className="text-center text-xs text-[#86948a]">
              New entity?{" "}
              <Link href="/signup" className="text-[#10b981] hover:underline font-bold">
                Initialize Account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#86948a] uppercase tracking-widest">
              <Shield className="h-3 w-3" />
              Secure Gateway
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
