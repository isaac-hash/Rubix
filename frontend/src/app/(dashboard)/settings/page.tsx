"use client";

import { useState } from "react";
import { 
  Key, 
  Globe, 
  Copy, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Send, 
  Save,
  ShieldCheck,
  AlertCircle,
  Mail
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Cookies from "js-cookie";

export default function SettingsPage() {
  const [showSecret, setShowSecret] = useState(false);
  const [showSigningSecret, setShowSigningSecret] = useState(false);
  const apiKey = Cookies.get("subpay_api_key") || "rbx_live_sk_7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-bold tracking-tight text-white font-display">Developer Settings</h1>
        <p className="text-[#86948a] text-sm mt-1">Manage your API keys and webhook configurations for integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Keys Card */}
        <Card className="p-8 space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-[#10b981]" />
              <h2 className="text-xl font-bold text-white">API Keys</h2>
            </div>
            <span className="px-2 py-0.5 bg-[#0b513d] text-[#10b981] text-[10px] font-bold uppercase tracking-widest rounded-[4px]">
              Live Environment
            </span>
          </div>

          <p className="text-sm text-[#86948a] leading-relaxed">
            These keys allow you to authenticate API requests. Keep your secret key safe and never share it publicly.
          </p>

          <div className="space-y-6">
            {/* Secret Key */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#86948a] uppercase tracking-widest ml-1">Secret Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type={showSecret ? "text" : "password"}
                    readOnly
                    value={apiKey}
                    className="w-full bg-[#0b0f10] border border-[#1c2021] rounded-[4px] px-4 py-2.5 text-[13px] font-mono text-[#10b981] outline-none"
                  />
                  <button 
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86948a] hover:text-white"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button variant="secondary" className="px-3">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-[#86948a] ml-1">Use this key on your server-side code to make API calls.</p>
            </div>

            {/* Public Key */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#86948a] uppercase tracking-widest ml-1">Public Key</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-[#0b0f10] border border-[#1c2021] rounded-[4px] px-4 py-2.5 text-[13px] font-mono text-[#e0e3e4]">
                  pk_live_09876zyxwv54321utsrq
                </div>
                <Button variant="secondary" className="px-3">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-[#86948a] ml-1">Use this key in your client-side code (e.g., checkout forms).</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors">
              <RotateCcw className="h-3.5 w-3.5" />
              Roll Keys
            </button>
          </div>
        </Card>

        {/* Webhooks Card */}
        <Card className="p-8 space-y-8">
          {/* ... (previous webhook content) */}
        </Card>

        {/* Notifications Configuration */}
        <Card className="p-8 space-y-8 lg:col-span-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5 text-[#10b981]" />
              <h2 className="text-xl font-bold text-white">Automated Notifications</h2>
            </div>
            <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest px-2 py-0.5 bg-[#10b981]/10 rounded-sm">Multi-Channel Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-10 h-10 rounded-md bg-[#181c1d] flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#86948a]" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-white">Email Alerts (Brevo)</p>
                    <div className="w-8 h-4 bg-[#10b981] rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#86948a] leading-relaxed">
                    Send transactional emails for renewals, failed payments, and receipts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-10 h-10 rounded-md bg-[#181c1d] flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-[#86948a]" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-white">SMS Alerts (Termii)</p>
                    <div className="w-8 h-4 bg-[#10b981] rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#86948a] leading-relaxed">
                    Direct SMS notifications to Nigerian customers for high-priority updates.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Input 
                label="Sender Name" 
                placeholder="Acme Billing" 
                defaultValue="SubPay Africa"
                className="bg-[#0b0f10]"
              />
              <Input 
                label="Reply-to Email" 
                placeholder="support@acme.com" 
                defaultValue="noreply@subpay.africa"
                className="bg-[#0b0f10]"
              />
              <Button className="w-full h-11">
                <Save className="mr-2 h-4 w-4" />
                Update Channels
              </Button>
            </div>
          </div>
        </Card>
      </div>


      {/* Security Tip */}
      <Card className="p-6 bg-blue-500/5 border-blue-500/20 flex gap-4 items-start">
        <div className="p-2 rounded-[4px] bg-blue-500/10">
          <AlertCircle className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Infrastructure Security Best Practice</h4>
          <p className="text-xs text-[#86948a] leading-relaxed">
            Never store your secret keys in your frontend code or version control. Always use environment variables on your backend to handle Rubix authentication.
          </p>
        </div>
      </Card>
    </div>
  );
}
