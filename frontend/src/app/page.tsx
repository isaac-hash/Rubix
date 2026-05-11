"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2,
  Globe,
  Code2,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f10] text-[#e0e3e4] selection:bg-[#10b981]/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-[#1c2021] bg-[#0b0f10]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#10b981] rounded-[4px] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Zap className="h-5 w-5 text-[#0b0f10] fill-current" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Rubix</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              {["My Subscriptions", "Billing", "Support"].map((item) => (
                <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-[#86948a] hover:text-white transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-xs font-bold uppercase tracking-widest text-[#86948a] hover:text-[#10b981] transition-colors">
              Merchant Login
            </Link>
            <Button className="h-10 px-6">
              Magic Link Login
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#10b981]">
                Infrastructure Layer Live
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight leading-[0.95]">
              Rubix Infrastructure <br />
              <span className="text-[#10b981]">for Africa</span>
            </h1>

            <p className="text-xl text-[#86948a] leading-relaxed max-w-lg font-medium">
              Accept recurring bank transfers without the card friction. API-first, mobile-ready, trust-built.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-base">
                  Get API Keys
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-[#1c2021] text-[#e0e3e4]">
                <BookOpen className="mr-2 h-5 w-5" />
                View Docs
              </Button>
            </div>

            <div className="pt-12">
              <p className="text-[10px] font-bold text-[#86948a] uppercase tracking-widest mb-4">
                Trusted by innovative teams
              </p>
              <div className="flex items-center gap-8 opacity-40 grayscale">
                <div className="h-6 w-24 bg-white/10 rounded-sm" />
                <div className="h-6 w-24 bg-white/10 rounded-sm" />
                <div className="h-6 w-24 bg-white/10 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Right: Code/UI Showcase */}
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute -inset-40 bg-[#10b981]/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative space-y-6">
              {/* Code Window */}
              <div className="bg-[#101415] border border-[#1c2021] rounded-md overflow-hidden shadow-2xl">
                <div className="h-10 bg-[#181c1d] border-b border-[#1c2021] flex items-center px-4 justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]/30" />
                  </div>
                  <div className="text-[10px] font-mono text-[#86948a] uppercase tracking-widest">create_subscription.py</div>
                  <div className="w-10" />
                </div>
                <div className="p-8 font-mono text-sm leading-relaxed">
                  <p className="text-[#10b981] mb-4"><span className="text-slate-500">import</span> rubix</p>
                  <p className="mb-1"><span className="text-[#10b981]">def</span> <span className="text-blue-400">create_plan</span>():</p>
                  <p className="pl-4 mb-4">client = rubix.<span className="text-blue-400">Client</span>(api_key=<span className="text-amber-400">'sk_test_123'</span>)</p>
                  <p className="pl-4">plan = client.plans.<span className="text-blue-400">create</span>(</p>
                  <p className="pl-8">name=<span className="text-amber-400">'Pro Tier'</span>,</p>
                  <p className="pl-8">amount=<span className="text-[#10b981]">5000</span>, <span className="text-slate-500"># in kobo</span></p>
                  <p className="pl-8">interval=<span className="text-amber-400">'monthly'</span>,</p>
                  <p className="pl-8">currency=<span className="text-amber-400">'NGN'</span></p>
                  <p className="pl-4">)</p>
                  <p className="pl-4 mt-4"><span className="text-[#10b981]">return</span> plan.id</p>
                  <p className="mt-8 text-slate-500 text-[10px]"># Effortless integration in minutes</p>
                </div>
              </div>

              {/* Float Component: Payment Success */}
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-10 -right-6 w-72 bg-[#101415] border border-[#10b981]/50 rounded-md p-6 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                  </div>
                  <span className="text-sm font-bold text-white tracking-tight">Payment Successful</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-[#86948a] uppercase tracking-wider">Pro Tier</span>
                    <span className="text-white">₦ 5,000/m</span>
                  </div>
                  <div className="h-1 w-full bg-[#181c1d] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, delay: 1 }}
                      className="h-full bg-[#10b981]" 
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1c2021] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[11px] font-bold text-[#86948a] uppercase tracking-[0.2em]">
            © 2026 Rubix Africa. Secure infrastructure for modern payments.
          </p>
          <div className="flex items-center gap-8">
            {["Terms", "Privacy", "API Docs", "Status"].map((link) => (
              <Link key={link} href="#" className="text-[10px] font-bold uppercase tracking-widest text-[#86948a] hover:text-white transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
