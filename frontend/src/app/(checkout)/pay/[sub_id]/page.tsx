"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Zap, 
  Copy, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  AlertTriangle,
  Building2,
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface CheckoutData {
  id: string;
  status: string;
  amount: number;
  currency: string;
  expires_at: string;
  merchant_name: string;
  plan_name: string;
  customer_name: string;
  customer_email: string;
  virtual_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
    amount: number;
    expires_at: string;
  };
}

export default function CheckoutPage() {
  const { sub_id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/subscriptions/checkout/${sub_id}`);
      setData(res.data);
      if (res.data.status === "active") {
        setPolling(false);
      }
    } catch (err) {
      console.error("Checkout fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(() => {
      if (data?.status === "pending_payment") {
        fetchDetails();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sub_id, data?.status]);

  useEffect(() => {
    if (!data?.expires_at) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(data.expires_at).getTime();
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
        return;
      }
      
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [data?.expires_at]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f10] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-[#10b981] animate-spin" />
          <p className="text-[#86948a] text-sm animate-pulse">Securing payment gateway...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0b0f10] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-white">Payment Session Not Found</h1>
          <p className="text-[#86948a] text-sm">This checkout link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  const isPaid = data.status === "active";

  return (
    <div className="min-h-screen bg-[#0b0f10] text-[#e0e3e4] selection:bg-[#10b981]/30">
      <div className="max-w-md mx-auto pt-12 pb-20 px-6">
        {/* Merchant Branding */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-[#181c1d] border border-[#1c2021] rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Building2 className="h-8 w-8 text-[#10b981]" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#86948a] mb-1">Paying To</h2>
          <h1 className="text-2xl font-bold text-white tracking-tight">{data.merchant_name}</h1>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full">
            <ShieldCheck className="h-3 w-3 text-[#10b981]" />
            <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">Secured by Rubix</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isPaid ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 bg-[#10b981] rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="h-10 w-10 text-[#0b0f10]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Payment Successful</h2>
                <p className="text-[#86948a] text-sm">Your subscription to <span className="text-white font-medium">{data.plan_name}</span> is now active.</p>
              </div>
              <Card className="p-6 bg-[#181c1d]/50 border-[#1c2021] text-left">
                <h3 className="text-xs font-bold text-[#86948a] uppercase tracking-widest mb-4">What's Next?</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-4 h-4 rounded-full bg-[#10b981]/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    </div>
                    <p className="text-xs text-[#e0e3e4]">You'll receive a receipt at <span className="font-medium">{data.customer_email}</span></p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-4 h-4 rounded-full bg-[#10b981]/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    </div>
                    <p className="text-xs text-[#e0e3e4]">We'll nudge you on WhatsApp before your next renewal.</p>
                  </li>
                </ul>
              </Card>
              <Button className="w-full h-12 text-sm font-bold uppercase tracking-widest">
                Return to Merchant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Amount Display */}
              <div className="text-center p-8 bg-[#101415] border border-[#1c2021] rounded-2xl">
                <h3 className="text-[10px] font-bold text-[#86948a] uppercase tracking-[0.2em] mb-2">Amount to Transfer</h3>
                <div className="text-4xl font-bold text-white tracking-tight">
                  ₦{(data.amount / 100).toLocaleString()}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  <Clock className="h-3 w-3" />
                  Expires in {timeLeft}
                </div>
              </div>

              {/* Bank Details Card */}
              <Card className="p-8 space-y-6 bg-[#181c1d] border-[#1c2021] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Building2 className="h-20 w-20 text-white" />
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#86948a] uppercase tracking-widest">Bank Name</p>
                    <p className="text-lg font-bold text-white">{data.virtual_account?.bank_name}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#86948a] uppercase tracking-widest">Account Number</p>
                    <div className="flex items-center justify-between group">
                      <p className="text-3xl font-mono font-bold text-[#10b981] tracking-wider">
                        {data.virtual_account?.account_number}
                      </p>
                      <button 
                        onClick={() => copyToClipboard(data.virtual_account?.account_number || "")}
                        className="p-2 hover:bg-[#10b981]/10 rounded-md transition-colors text-[#10b981]"
                      >
                        {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#86948a] uppercase tracking-widest">Account Name</p>
                    <p className="text-sm font-medium text-[#e0e3e4]">{data.virtual_account?.account_name}</p>
                  </div>
                </div>
              </Card>

              {/* Warnings & CTAs */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#101415] border border-[#1c2021] flex gap-3 items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-[#86948a] leading-relaxed">
                    Please ensure you send the <span className="text-white font-bold underline">exact amount</span>. Most transfers are matched within 60 seconds.
                  </p>
                </div>

                <Button 
                  onClick={() => setPolling(true)}
                  disabled={polling}
                  className="w-full h-14 text-sm font-bold uppercase tracking-[0.1em]"
                >
                  {polling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Waiting for transfer...
                    </>
                  ) : (
                    "I Have Sent the Money"
                  )}
                </Button>
                
                <p className="text-center text-[10px] font-medium text-[#86948a] uppercase tracking-widest">
                  Secure Bank Transfer via Rubix Infrastructure
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-center border-t border-[#1c2021] bg-[#0b0f10]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#86948a] uppercase tracking-[0.2em]">Powered by</span>
          <div className="flex items-center gap-1.5 opacity-80">
            <div className="w-5 h-5 bg-[#10b981] rounded-[3px] flex items-center justify-center">
              <Zap className="h-3 w-3 text-[#0b0f10] fill-current" />
            </div>
            <span className="text-xs font-bold text-white tracking-tight">Rubix</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
