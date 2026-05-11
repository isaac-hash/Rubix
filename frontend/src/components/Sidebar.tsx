"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Settings, 
  Zap, 
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearApiKey } from "@/lib/api";

const menuItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Plans", href: "/plans", icon: CreditCard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "API & Webhooks", href: "/settings", icon: Zap },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-background border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
            <Zap className="h-6 w-6 text-background fill-current" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight text-white">
            SubPay
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "group-hover:text-white")} />
                <span className="font-medium">{item.name}</span>
              </div>
              {isActive && (
                <motion.div layoutId="active-indicator">
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            clearApiKey();
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

// Add framer-motion import here since I used motion.div
import { motion } from "framer-motion";
