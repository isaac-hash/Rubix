"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Archive, 
  CheckCircle2, 
  Clock,
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";
import { Plan } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPlans = async () => {
    setIsLoading(true);
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

  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleCreatePlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      amount: Number(formData.get("amount")) * 100, // Convert to kobo
      currency: "NGN",
      interval: formData.get("interval"),
    };

    try {
      await api.post("/plans", data);
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      alert("Failed to create plan");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white">Billing Plans</h1>
          <p className="text-slate-400 mt-1">Manage the recurring offers your customers subscribe to.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search plans..."
          className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl h-14 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="group relative">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-bold text-white">{plan.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="capitalize">{plan.interval} billing</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${plan.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                  {plan.is_active ? "Active" : "Archived"}
                </div>
              </div>

              <div className="mt-8">
                <span className="text-3xl font-display font-bold text-white">
                  ₦{(plan.amount / 100).toLocaleString()}
                </span>
                <span className="text-slate-500 ml-1">/{plan.interval}</span>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/50 flex gap-3">
                <Button variant="secondary" size="sm" className="flex-1">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button variant="outline" size="sm" className="px-3">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Plan Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <Card className="w-full max-w-lg relative z-10 p-8">
              <h2 className="text-2xl font-display font-bold text-white mb-6">Create Billing Plan</h2>
              <form onSubmit={handleCreatePlan} className="space-y-6">
                <Input name="name" label="Plan Name" placeholder="e.g. Premium Monthly" required />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="amount" type="number" label="Price (NGN)" placeholder="5000" required />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">Interval</label>
                    <select name="interval" defaultValue="monthly" className="flex h-12 w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>

                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Create Plan
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
