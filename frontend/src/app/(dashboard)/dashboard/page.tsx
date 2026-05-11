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
  ShieldCheck,
  Loader2
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Stats } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";


export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get("/merchants/me/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch merchant stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const topStats = stats ? [
    { name: "Active Subscriptions", value: stats.active_subscriptions.toLocaleString(), icon: Users, trend: "Real-time", color: "text-[#10b981]" },
    { name: "Monthly Recurring Revenue (MRR)", value: `₦${(stats.mrr / 100).toLocaleString()}`, icon: TrendingUp, trend: "Active billing", color: "text-[#10b981]" },
    { name: "Success Rate", value: `${stats.success_rate}%`, icon: Activity, trend: "Renewal health", color: "text-[#10b981]" },
  ] : [];


  const recentSubs = [
    { name: "Adeoluwa B.", plan: "Pro Annual", amount: "₦150,000", status: "Active", date: "Oct 24, 2023" },
    { name: "TechCorp Ltd.", plan: "Enterprise", amount: "₦850,000", status: "Pending", date: "Oct 24, 2023" },
    { name: "Ngozi E.", plan: "Starter Monthly", amount: "₦5,000", status: "Lapsed", date: "Oct 23, 2023" },
    { name: "Ibrahim M.", plan: "Business", amount: "₦15,000", status: "Active", date: "Oct 23, 2023" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 text-[#10b981] animate-spin" />
        <p className="text-[#86948a] text-sm font-medium animate-pulse">Calculating your empire...</p>
      </div>
    );
  }

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
        {/* Revenue Growth Chart */}
        <Card className="lg:col-span-2 p-8 h-[480px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold text-white">Revenue Growth</h3>
            <div className="flex items-center bg-[#0b0f10] border border-[#1c2021] rounded-[4px] p-1 gap-1">
              <button className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#101415] rounded-[2px]">Last 7 Days</button>
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-2 md:gap-4 pb-4">
            {stats?.growth_data.map((item, i) => {
              // Calculate a simulated height if value is 0 for demo, otherwise use real value
              const h = item.value > 0 ? (item.value / stats.mrr) * 100 : (i + 2) * 10;
              return (
                <div key={i} className="flex-1 group relative">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(5, h)}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={cn(
                      "w-full rounded-t-[2px] transition-all relative",
                      i === (stats?.growth_data.length - 1) ? "bg-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-[#10b981]/20 hover:bg-[#10b981]/40"
                    )}
                  />
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-[#86948a] font-mono">
                    {item.day}
                  </div>
                </div>
              );
            })}
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
