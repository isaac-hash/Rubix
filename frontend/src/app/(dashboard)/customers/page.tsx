"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Download, 
  MoreVertical, 
  Users,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  ShieldCheck
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { Customer } from "@/types";
import { cn } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers");
        setCustomers(res.data);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-[32px] font-bold tracking-tight text-white font-display">Directory</h1>
          <span className="px-2 py-0.5 bg-[#181c1d] border border-[#1c2021] text-[#86948a] text-[10px] font-bold rounded-[4px] mt-2">
            {customers.length} Total
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86948a]" />
            <input 
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0f10] border border-[#1c2021] rounded-[4px] pl-10 pr-4 py-2 text-sm text-white focus:border-[#10b981] transition-colors outline-none"
            />
          </div>
          <Button variant="outline" size="sm" className="h-10 text-[11px] font-bold uppercase tracking-wider">
            <Download className="h-3.5 w-3.5 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* High-Density Table */}
      <Card className="p-0 overflow-hidden border-[#1c2021] bg-[#101415]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1c2021] bg-[#181c1d]/30">
                <th className="p-4 w-12">
                  <div className="w-4 h-4 border border-[#313536] rounded-[2px]" />
                </th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Customer Profile</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Contact Email</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Total Paid (NGN)</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Current Status</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2021]">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#181c1d]/50 transition-colors group cursor-pointer">
                    <td className="p-4">
                      <div className="w-4 h-4 border border-[#313536] rounded-[2px] group-hover:border-[#10b981] transition-colors" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#181c1d] border border-[#1c2021] flex items-center justify-center text-[13px] font-bold text-[#e0e3e4]">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-white">{customer.name}</p>
                          <p className="text-[10px] font-mono text-[#86948a]">cus_{customer.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#86948a]">
                      {customer.email}
                    </td>
                    <td className="p-4 text-sm font-semibold text-white">
                      ₦ 12,450.00
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#0b513d] text-[#10b981] text-[10px] font-bold uppercase tracking-tighter rounded-[2px]">
                        <div className="w-1 h-1 rounded-full bg-[#10b981]" />
                        Active
                      </span>
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
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4 text-[#86948a]">
                      <Users className="h-12 w-12 opacity-10" />
                      <p className="text-sm font-medium">No customers found in the directory.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-[#1c2021] flex items-center justify-between">
          <p className="text-[11px] text-[#86948a] font-medium">
            Showing 1 to {filteredCustomers.length} of {customers.length} results
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-[4px] border border-[#1c2021] text-[#86948a] hover:bg-[#181c1d] disabled:opacity-30" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-[4px] bg-[#10b981] text-[#0b0f10] text-xs font-bold">1</button>
              <button className="w-8 h-8 rounded-[4px] border border-[#1c2021] text-[#86948a] text-xs font-bold hover:bg-[#181c1d]">2</button>
              <button className="w-8 h-8 rounded-[4px] border border-[#1c2021] text-[#86948a] text-xs font-bold hover:bg-[#181c1d]">3</button>
            </div>
            <button className="p-1.5 rounded-[4px] border border-[#1c2021] text-[#86948a] hover:bg-[#181c1d]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
      
      {/* Footer Branding */}
      <div className="flex justify-between items-center pt-8 border-t border-[#1c2021] text-[10px] font-medium text-[#86948a] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3 w-3 text-[#10b981]" />
          Secure Infrastructure for Modern Payments
        </div>
        <p>© 2026 Rubix Infrastructure</p>
      </div>
    </div>
  );
}
