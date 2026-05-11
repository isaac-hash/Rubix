"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Copy, Check, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import api, { setApiKey } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Form, 2: Reveal API Key
  const [merchantData, setMerchantData] = useState<{ name: string; email: string; api_key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await api.post("/auth/signup", data);
      const { api_key, ...merchant } = response.data;
      
      setMerchantData({ ...merchant, api_key });
      setApiKey(api_key); // Set for future requests
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (merchantData?.api_key) {
      navigator.clipboard.writeText(merchantData.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />

      <Card className="w-full max-w-lg relative z-10 p-8 sm:p-12">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-display font-bold tracking-tight text-gradient">
                  Grow with SubPay
                </h1>
                <p className="text-slate-400">
                  Join the subscription infrastructure built for scale.
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-5">
                <Input name="name" label="Organization Name" placeholder="e.g. Acme Africa" required />
                <Input name="email" type="email" label="Work Email" placeholder="you@company.com" required />
                <Input name="password" type="password" label="Password" placeholder="••••••••" required />
                
                {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}

                <Button type="submit" className="w-full h-12" isLoading={isLoading}>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 text-center"
            >
              <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="h-10 w-10 text-emerald-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-white">Your Secret API Key</h2>
                <p className="text-slate-400 max-w-sm mx-auto text-sm">
                  This is your only chance to see this key. Store it securely; we don't save it in plain text.
                </p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative flex items-center bg-slate-950 rounded-xl border border-slate-800 p-4 gap-4 overflow-hidden">
                  <code className="flex-1 text-sm text-amber-500 font-mono break-all text-left">
                    {merchantData?.api_key}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Button onClick={() => router.push("/")} variant="primary" className="w-full h-12">
                  Enter Dashboard
                </Button>
                <p className="text-xs text-slate-500 italic">
                  By clicking above, you confirm you've saved your API key.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
