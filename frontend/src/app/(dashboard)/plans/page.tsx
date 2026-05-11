"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Archive,
  CreditCard
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";
import { Plan } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPlans = async () => {
    try {
      const res = await api.get("/plans");
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      amount: parseInt(formData.get("amount") as string) * 100, // Convert to kobo
      currency: "NGN",
      interval: formData.get("interval"),
    };

    try {
      await api.post("/plans", data);
      setShowCreateModal(false);
      fetchPlans();
    } catch (err) {
      alert("Failed to create plan");
    }
  };

  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const planStats = [
    { label: "Active Plans", value: plans.length.toString(), trend: "+2 this month" },
    { label: "Total Subscribers", value: "4,821", trend: "+15%" },
    { label: "Monthly Recurring Rev", value: "₦ 24.5M", trend: "Stable" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-white font-display">Plans</h1>
          <p className="text-[#86948a] text-sm mt-1">Manage subscription tiers and pricing models.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86948a]" />
            <input 
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0f10] border border-[#1c2021] rounded-[4px] pl-10 pr-4 py-2 text-sm text-white focus:border-[#10b981] transition-colors outline-none"
            />
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="h-10">
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planStats.map((stat) => (
          <Card key={stat.label} className="p-5 bg-[#101415]/50">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#86948a]">
                {stat.label}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
              <span className={cn(
                "text-[10px] font-bold",
                stat.trend === "Stable" ? "text-[#86948a]" : "text-[#10b981]"
              )}>
                {stat.trend.startsWith('+') && <ArrowUpRight className="inline h-3 w-3 mr-0.5" />}
                {stat.trend}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="p-0 flex flex-col h-full group hover:border-[#10b981]/50 transition-all duration-300">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-bold text-white group-hover:text-[#10b981] transition-colors">{plan.name}</h3>
                <span className="px-1.5 py-0.5 bg-[#0b513d] text-[#10b981] text-[9px] font-bold uppercase tracking-tighter rounded-[2px]">
                  Active
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#86948a] mb-6">PLN_{plan.id.slice(0, 8).toUpperCase()}</p>
              
              <div className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">₦ {(plan.amount / 100).toLocaleString()}</span>
                  <span className="text-xs text-[#86948a]">/{plan.interval}</span>
                </div>
                <p className="text-xs text-[#86948a] leading-relaxed">
                  Standard access to core infrastructure and automated renewal tracking.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#0b0f10]/50 border-t border-[#1c2021] flex justify-between items-center text-[10px] font-medium">
              <div className="space-y-1">
                <p className="text-[#86948a] uppercase tracking-wider">Subscribers</p>
                <p className="text-white font-bold">1,204</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[#86948a] uppercase tracking-wider">Created</p>
                <p className="text-white font-bold">{new Date(plan.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        ))}

        {/* Empty State / Create Card */}
        <button 
          onClick={() => setShowCreateModal(true)}
          className="border border-dashed border-[#1c2021] rounded-[4px] p-8 flex flex-col items-center justify-center gap-3 text-[#86948a] hover:border-[#10b981] hover:text-[#10b981] transition-all min-h-[200px]"
        >
          <div className="w-10 h-10 rounded-full bg-[#181c1d] flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Add New Tier</span>
        </button>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0b0f10]/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg"
            >
              <Card className="p-8 border-[#1c2021] bg-[#101415] shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-white tracking-tight">Provision New Plan</h2>
                  <button onClick={() => setShowCreateModal(false)} className="text-[#86948a] hover:text-white">
                    <Plus className="h-5 w-5 rotate-45" />
                  </button>
                </div>

                <form onSubmit={handleCreatePlan} className="space-y-6">
                  <Input name="name" label="Plan Name" placeholder="e.g. Pro Monthly" required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input name="amount" type="number" label="Unit Price (NGN)" placeholder="5000" required />
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#86948a] uppercase tracking-widest ml-1">Billing Interval</label>
                      <select name="interval" defaultValue="monthly" className="flex h-11 w-full rounded-[4px] border border-[#1c2021] bg-[#0b0f10] px-4 py-2 text-sm text-white focus:border-[#10b981] outline-none transition-colors">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Initialize Plan
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
