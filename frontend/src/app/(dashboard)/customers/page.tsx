"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { Customer } from "@/types";
import { motion } from "framer-motion";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await api.get("/customers");
        setCustomers(res.data);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-white">Customers</h1>
        <p className="text-slate-400 mt-1">View and manage the people using your services.</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl h-14 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 px-6">
          <Filter className="mr-2 h-5 w-5" />
          Filter
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30">
                <th className="px-6 py-4 text-sm font-medium text-slate-400">Customer</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-400">Contact</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-400">Joined</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-900/40 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/5 font-bold text-slate-300">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{customer.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{customer.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Mail className="h-3.5 w-3.5" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Phone className="h-3.5 w-3.5" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${customer.claimed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {customer.claimed ? "Claimed" : "Unclaimed"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-500">
                      <Users className="h-12 w-12 opacity-20" />
                      <p>No customers found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
