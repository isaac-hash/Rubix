"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Download, 
  MoreVertical, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// Subscription Status Types matching the backend
type SubscriptionStatus = "active" | "pending_payment" | "pending_renewal" | "lapsed" | "cancelled";

interface Subscription {
  id: string;
  status: SubscriptionStatus;
  customer_id: string;
  plan_id: string;
  created_at: string;
  renewal_date: string | null;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriptionStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubscriptions = async () => {
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const res = await api.get("/subscriptions", { params });
      setSubscriptions(res.data);
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const filteredSubs = subscriptions.filter(sub => 
    sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.customer_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusTabs: { label: string; value: "all" | SubscriptionStatus }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending_payment" },
    { label: "Past Due", value: "lapsed" },
    { label: "Canceled", value: "cancelled" },
  ];

  const getStatusStyle = (status: SubscriptionStatus) => {
    switch (status) {
      case "active": return "bg-[#0b513d] text-[#10b981]";
      case "pending_payment": 
      case "pending_renewal": return "bg-[#181c1d] text-[#86948a]";
      case "lapsed": return "bg-amber-500/10 text-amber-500";
      case "cancelled": return "bg-rose-500/10 text-rose-500";
      default: return "bg-[#181c1d] text-[#86948a]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-white font-display">Subscriptions</h1>
          <p className="text-[#86948a] text-sm mt-1">Manage and monitor all active recurring billing cycles.</p>
        </div>
        <Button variant="outline" className="h-10 text-[11px] font-bold uppercase tracking-wider border-[#1c2021] text-[#10b981]">
          <Download className="h-3.5 w-3.5 mr-2" />
          Export
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-[#101415]/50 border-[#1c2021]">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86948a]" />
            <input 
              type="text"
              placeholder="Search by customer or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0f10] border border-[#1c2021] rounded-[4px] pl-10 pr-4 py-2 text-sm text-white focus:border-[#10b981] transition-colors outline-none"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-[#0b0f10] border border-[#1c2021] rounded-[4px] p-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-[2px] transition-all",
                  statusFilter === tab.value 
                    ? "bg-[#181c1d] text-white" 
                    : "text-[#86948a] hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card className="p-0 overflow-hidden border-[#1c2021] bg-[#101415]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1c2021] bg-[#181c1d]/30">
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Customer</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Plan</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Status</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Amount</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Last Payment</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2021]">
              {filteredSubs.length > 0 ? (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#181c1d]/50 transition-colors group cursor-pointer">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#181c1d] border border-[#1c2021] flex items-center justify-center text-[11px] font-bold text-[#86948a]">
                          {sub.customer_id.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-white group-hover:text-[#10b981] transition-colors">
                            Customer {sub.customer_id.slice(0, 4)}
                          </p>
                          <p className="text-[10px] font-mono text-[#86948a]">sub_{sub.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-white">Basic Tier (Monthly)</p>
                        <p className="text-[10px] text-[#86948a]">Provisioned via API</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter rounded-[2px]",
                        getStatusStyle(sub.status)
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", sub.status === 'active' ? 'bg-[#10b981]' : 'bg-current')} />
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-white">
                      ₦ 15,000
                    </td>
                    <td className="p-4 text-sm text-[#86948a]">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-1 text-[#86948a] hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="flex flex-col items-center gap-4 text-[#86948a]">
                      <Layers className="h-12 w-12 opacity-10" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">No recurring subscriptions found.</p>
                        <p className="text-xs opacity-60">Provision your first subscription via the API to see it here.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c2021] flex items-center justify-between">
          <p className="text-[11px] text-[#86948a] font-medium">
            Showing 1 to {filteredSubs.length} of {subscriptions.length} results
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-[4px] border border-[#1c2021] text-[#86948a] hover:bg-[#181c1d] transition-all">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-[4px] border border-[#1c2021] text-[#86948a] hover:bg-[#181c1d] transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
