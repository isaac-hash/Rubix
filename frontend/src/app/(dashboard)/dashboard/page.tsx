"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  Plus,
  Calendar,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  ShieldCheck
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Stats } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";


export default function OverviewPage() {
  const [stats, setStats] = useState<Stats>({
    total_revenue: 42500000,
    active_subscriptions: 14208,
    total_customers: 0,
    failed_webhooks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch to match design numbers
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const topStats = [
    { name: "Active Subscriptions", value: stats.active_subscriptions.toLocaleString(), icon: Users, trend: "+12.5% this month", color: "text-[#10b981]" },
    { name: "Monthly Recurring Revenue (MRR)", value: `₦${(stats.total_revenue / 100).toLocaleString()}`, icon: TrendingUp, trend: "+8.2% this month", color: "text-[#10b981]" },
    { name: "Success Rate", value: "99.98%", icon: Activity, trend: "Stable", color: "text-[#10b981]" },
  ];

  const recentSubs = [
    { name: "Adeoluwa B.", plan: "Pro Annual", amount: "₦150,000", status: "Active", date: "Oct 24, 2023" },
    { name: "TechCorp Ltd.", plan: "Enterprise", amount: "₦850,000", status: "Pending", date: "Oct 24, 2023" },
    { name: "Ngozi E.", plan: "Starter Monthly", amount: "₦5,000", status: "Lapsed", date: "Oct 23, 2023" },
    { name: "Ibrahim M.", plan: "Business", amount: "₦15,000", status: "Active", date: "Oct 23, 2023" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-white font-display">Overview</h1>
          <p className="text-[#86948a] text-sm mt-1">Monitor your subscription health and infrastructure metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="h-9 w-9 p-0">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" className="h-9 w-9 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topStats.map((stat, i) => (
          <Card key={stat.name} className="p-6">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#86948a]">
                {stat.name}
              </span>
              <div className="p-1.5 rounded-[4px] bg-[#10b981]/10">
                <stat.icon className="h-3.5 w-3.5 text-[#10b981]" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-[32px] font-bold text-white tracking-tight leading-none">
                {i === 2 && <span className="text-[#10b981] mr-1"></span>}
                {stat.value}
              </p>
              <div className="flex items-center text-[11px] font-medium text-[#10b981]">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                {stat.trend}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart Placeholder */}
        <Card className="lg:col-span-2 p-8 h-[480px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold text-white">Revenue Growth</h3>
            <div className="flex items-center bg-[#0b0f10] border border-[#1c2021] rounded-[4px] p-1 gap-1">
              <button className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#101415] rounded-[2px]">Last 30 Days</button>
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-2 md:gap-4 pb-4">
            {[40, 55, 45, 65, 50, 80, 75, 100].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className={cn(
                    "w-full rounded-t-[2px] transition-all relative",
                    i === 7 ? "bg-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-[#10b981]/20 hover:bg-[#10b981]/40"
                  )}
                />
                <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-[#86948a] font-mono">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'][i]}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Subscriptions */}
        <Card className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Recent Subscriptions</h3>
            <Link href="/subscriptions" className="text-[11px] font-bold text-[#10b981] uppercase tracking-wider hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-6">
            {recentSubs.map((sub, i) => (
              <div key={i} className="flex justify-between items-start group cursor-pointer">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white group-hover:text-[#10b981] transition-colors">{sub.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#86948a]">{sub.plan}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-tighter",
                      sub.status === 'Active' ? 'bg-[#0b513d] text-[#10b981]' : 
                      sub.status === 'Pending' ? 'bg-[#181c1d] text-[#86948a]' : 
                      'bg-rose-500/10 text-rose-500'
                    )}>
                      {sub.status}
                    </span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-bold text-white">{sub.amount}</p>
                  <p className="text-[10px] text-[#86948a]">{sub.date}</p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="mt-auto w-full border-[#1c2021] text-[#86948a] hover:text-[#10b981]">
            Download Full Report
          </Button>
        </Card>
      </div>

      {/* Secondary Action */}
      <div className="fixed bottom-8 right-8">
        <Link href="/plans">
          <Button size="lg" className="rounded-full h-14 w-14 p-0 shadow-2xl">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
