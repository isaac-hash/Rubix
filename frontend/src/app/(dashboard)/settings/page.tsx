"use client";

import { useEffect, useState } from "react";
import { 
  Shield, 
  Zap, 
  Globe, 
  Copy, 
  Check, 
  RotateCcw,
  Save,
  Info
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";
import Cookies from "js-cookie";

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // In a real app, we might fetch the webhook URL from the merchant profile
    const savedKey = Cookies.get("subpay_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    // Simulate saving webhook URL to backend
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    alert("Settings saved successfully!");
  }

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-4xl font-display font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your API credentials and webhook endpoints.</p>
      </div>

      <div className="space-y-6">
        {/* API Credentials Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 font-medium ml-1">
            <Shield className="h-4 w-4" />
            <span>API Credentials</span>
          </div>
          <Card className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300">Secret API Key</label>
              <div className="relative flex items-center bg-slate-950 rounded-xl border border-slate-800 p-4 gap-4">
                <code className="flex-1 text-sm text-amber-500 font-mono break-all">
                  {apiKey}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/60 leading-relaxed">
                  Your API key grants full access to your SubPay account. Never share it or expose it in client-side code. If you suspect it's compromised, rotate it immediately.
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Button variant="outline" className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500">
                <RotateCcw className="mr-2 h-4 w-4" />
                Rotate Secret Key
              </Button>
            </div>
          </Card>
        </section>

        {/* Webhook Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 font-medium ml-1">
            <Globe className="h-4 w-4" />
            <span>Webhooks</span>
          </div>
          <Card className="p-8">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-4">
                <Input 
                  label="Webhook Endpoint URL" 
                  placeholder="https://your-api.com/webhooks/subpay" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="bg-slate-950"
                />
                <p className="text-xs text-slate-500 ml-1">
                  SubPay will send POST requests to this URL for events like <span className="text-slate-300 italic">subscription.activated</span> and <span className="text-slate-300 italic">payment.failed</span>.
                </p>
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-300 ml-1">Signing Secret</label>
                <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-4 gap-4 blur-[4px] select-none hover:blur-none transition-all duration-300">
                  <code className="flex-1 text-sm text-slate-500 font-mono">
                    whsec_6f2b1ccb705d6762bc4e46ae9a81029f95e9927
                  </code>
                </div>
                <p className="text-xs text-slate-500 ml-1 italic">Hover to reveal secret. Used to verify that webhooks are actually from SubPay.</p>
              </div>

              <div className="pt-4">
                <Button type="submit" isLoading={isSaving} className="px-10">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </section>
      </div>
    </div>
  );
}
