"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Sidebar } from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const apiKey = Cookies.get("subpay_api_key");
    if (!apiKey) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen bg-[#0b0f10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-[#10b981] rounded-[4px] flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <div className="w-5 h-5 border-2 border-[#0b0f10] border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-[0.2em]">Rubix Secure</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b0f10]">
      <Sidebar />
      <main className="flex-1 relative overflow-y-auto">
        <motion.div
          key="page-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-8 sm:p-12 max-w-7xl mx-auto w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );


}
