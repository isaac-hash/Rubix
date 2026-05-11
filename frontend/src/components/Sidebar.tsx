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
  LogOut,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearApiKey } from "@/lib/api";
import { motion } from "framer-motion";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Subscriptions", href: "/subscriptions", icon: Layers },
  { name: "Plans", href: "/plans", icon: CreditCard },
  { name: "Customers", href: "/customers", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] bg-[#0b0f10] border-r border-[#1c2021] flex flex-col h-screen sticky top-0 z-50">
      <div className="p-6 mb-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#10b981] rounded-[4px] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Zap className="h-5 w-5 text-[#0b0f10] fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-none">
              Rubix
            </span>
            <span className="text-[10px] font-semibold text-[#10b981] uppercase tracking-[0.1em] mt-1">
              Infrastructure
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-6 py-3 transition-all duration-200 relative",
                isActive 
                  ? "bg-[#10b981]/5 text-[#10b981]" 
                  : "text-[#86948a] hover:bg-[#181c1d] hover:text-white"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#10b981]" 
                />
              )}
              <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-[#10b981]" : "group-hover:text-white")} />
              <span className="text-[13px] font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-6 space-y-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-[4px] transition-all",
            pathname === "/settings" ? "text-white bg-[#1c2021]" : "text-[#86948a] hover:text-white"
          )}
        >
          <Settings className="h-4 w-4" />
          <span className="text-xs font-medium">Settings</span>
        </Link>
        <button
          onClick={() => {
            clearApiKey();
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-[#86948a] hover:text-[#ffb4ab] transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
