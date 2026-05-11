"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { Stats } from "@/types";
import Link from "next/link";

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats>({
    total_revenue: 0,
    active_subscriptions: 0,
    total_customers: 0,
    failed_webhooks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Since we don't have a /stats endpoint yet, we'll simulate or aggregate
        // For now, I'll fetch plans and customers to show something
        const [plansRes, customersRes] = await Promise.all([
          api.get("/plans"),
          api.get("/customers")
        ]);
        
        setStats({
          total_revenue: 12500000, // Hardcoded for demo until we have revenue tracking
          active_subscriptions: plansRes.data.length * 5, // Mocked
          total_customers: customersRes.data.length,
          failed_webhooks: 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { name: "Total Revenue", value: `₦${(stats.total_revenue / 100).toLocaleString()}`, icon: TrendingUp, trend: "+12.5%", color: "text-emerald-500" },
    { name: "Active Subscriptions", value: stats.active_subscriptions, icon: CreditCard, trend: "+4", color: "text-amber-500" },
    { name: "Total Customers", value: stats.total_customers, icon: Users, trend: "+2", color: "text-blue-500" },
    { name: "Failed Deliveries", value: stats.failed_webhooks, icon: Activity, trend: "0%", color: "text-rose-500" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your subscriptions today.</p>
        </div>
        <Link href="/plans">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Plan
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={stat.name} className="relative group hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl bg-slate-900/50 border border-white/5 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                {stat.trend}
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-400">{stat.name}</p>
              <p className="text-3xl font-display font-bold text-white mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 min-h-[400px] flex flex-col justify-center items-center text-center p-12 space-y-4">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
            <Activity className="h-10 w-10 text-slate-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-display font-bold text-white">No Recent Payments</h3>
            <p className="text-slate-400 max-w-sm">
              Your revenue chart will appear here once your customers start paying.
            </p>
          </div>
        </Card>

        <Card className="flex flex-col space-y-6">
          <h3 className="text-xl font-display font-bold text-white">Next Steps</h3>
          <div className="space-y-4">
            {[
              { label: "Configure your Webhook URL", href: "/settings", done: false },
              { label: "Create your first billing plan", href: "/plans", done: true },
              { label: "Integrate SubPay into your app", href: "https://docs.subpay.africa", done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${step.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 text-slate-500 group-hover:border-primary transition-colors'}`}>
                  {step.done ? "✓" : i + 1}
                </div>
                <Link href={step.href} className={`text-sm font-medium transition-colors ${step.done ? 'text-slate-400 line-through' : 'text-slate-200 group-hover:text-primary'}`}>
                  {step.label}
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
