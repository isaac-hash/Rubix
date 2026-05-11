"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Copy, 
  Check, 
  Lock, 
  ShieldCheck, 
  AlertTriangle,
  BookOpen,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import api, { setApiKey } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); 
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
      setApiKey(api_key);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b0f10]">
      <Card className="w-full max-w-5xl p-0 flex flex-col md:flex-row overflow-hidden border-[#1c2021] min-h-[600px]">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col md:flex-row w-full"
            >
              {/* Left Side: Brand/Marketing */}
              <div className="w-full md:w-1/2 bg-[#101415] p-12 flex flex-col justify-between border-r border-[#1c2021]">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10b981] rounded-[4px] flex items-center justify-center">
                      <Zap className="h-5 w-5 text-[#0b0f10] fill-current" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">Rubix</span>
                  </div>
                  
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
                      Scale your subscription infrastructure.
                    </h1>
                    <p className="text-[#86948a] text-lg leading-relaxed">
                      Join the network powering high-frequency recurring payments across the continent.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 pt-12 border-t border-[#1c2021]">
                  {[
                    "Architectural Stability",
                    "Automated Reconciliation",
                    "Multi-Channel Notifications"
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-3 text-sm font-medium text-[#e0e3e4]">
                      <ShieldCheck className="h-4 w-4 text-[#10b981]" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-[#0b0f10]">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Create Merchant Account</h2>
                    <p className="text-[#86948a] text-sm">Securely anchor your business to the Rubix ledger.</p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-6">
                    <Input name="name" label="Business Entity" placeholder="Acme Global Ltd." required />
                    <Input name="email" type="email" label="Administrator Email" placeholder="admin@acme.io" required />
                    <Input name="password" type="password" label="Authentication Credential" placeholder="••••••••" required />
                    
                    {error && <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">{error}</p>}

                    <Button type="submit" className="w-full h-12" isLoading={isLoading}>
                      Initialize Provisioning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  <p className="text-center text-xs text-[#86948a]">
                    Already on the ledger?{" "}
                    <Link href="/login" className="text-[#10b981] hover:underline font-bold">
                      Authenticate
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col md:flex-row w-full"
            >
              {/* Left Side: Success Status */}
              <div className="w-full md:w-1/2 bg-[#101415] p-12 flex flex-col justify-between border-r border-[#1c2021]">
                <div className="space-y-12">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10b981] rounded-[4px] flex items-center justify-center">
                      <Zap className="h-5 w-5 text-[#0b0f10] fill-current" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">Rubix</span>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[#10b981]">
                      <ShieldCheck className="h-6 w-6" />
                      <h2 className="text-xl font-bold">Infrastructure Provisioned</h2>
                    </div>
                    <p className="text-[#86948a] text-sm leading-relaxed">
                      Your merchant account has been created and securely anchored to the Rubix ledger.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#86948a] uppercase tracking-widest">Business Entity</label>
                      <div className="flex items-center justify-between p-3 bg-[#0b0f10] border border-[#1c2021] rounded-[4px] text-sm text-[#e0e3e4] opacity-50">
                        {merchantData?.name}
                        <Lock className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#86948a] uppercase tracking-widest">Administrator Email</label>
                      <div className="flex items-center justify-between p-3 bg-[#0b0f10] border border-[#1c2021] rounded-[4px] text-sm text-[#e0e3e4] opacity-50">
                        {merchantData?.email}
                        <Lock className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-[#86948a] uppercase tracking-[0.1em]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  End-to-End Encrypted Handshake
                </div>
              </div>

              {/* Right Side: Key Reveal */}
              <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-[#0b0f10]">
                <div className="space-y-10">
                  <div className="space-y-2">
                    <h2 className="text-[32px] font-bold text-white tracking-tight">Secret API Key Reveal</h2>
                    <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-[4px]">
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                      <p className="text-xs text-rose-500 font-medium leading-none">
                        Copy your LIVE key immediately. It will not be shown again.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-[#0b513d] text-[#10b981] text-[9px] font-bold uppercase tracking-tighter rounded-[2px]">
                          Live Environment
                        </span>
                        <span className="text-[10px] text-[#86948a] font-mono">rbx_live_...</span>
                      </div>
                      <div className="relative group">
                        <div className="absolute -inset-[1px] bg-[#10b981] rounded-[4px] opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative bg-[#0b0f10] border border-[#10b981] rounded-[4px] p-5 flex items-start gap-4">
                          <code className="flex-1 text-[13px] text-[#10b981] font-mono break-all leading-relaxed">
                            {merchantData?.api_key}
                          </code>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(merchantData?.api_key || "");
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-2 hover:bg-[#10b981]/10 rounded-[4px] transition-colors"
                          >
                            {copied ? <Check className="h-5 w-5 text-[#10b981]" /> : <Copy className="h-5 w-5 text-[#10b981]" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 opacity-40 grayscale">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-[#1c2021] text-[#86948a] text-[9px] font-bold uppercase tracking-tighter rounded-[2px]">
                          Test Environment
                        </span>
                        <span className="text-[10px] text-[#86948a] font-mono">rbx_test_...</span>
                      </div>
                      <div className="bg-[#0b0f10] border border-[#1c2021] rounded-[4px] p-4 flex items-center gap-4">
                        <code className="flex-1 text-[11px] text-[#86948a] font-mono truncate">
                          rbx_test_sk_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b
                        </code>
                        <Copy className="h-4 w-4 text-[#86948a]" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#1c2021] flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => router.push("/")} className="flex-1 h-12">
                      Access Developer Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="flex-1 h-12">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Read API Docs
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
