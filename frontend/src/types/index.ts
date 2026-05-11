export interface Merchant {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  claimed: boolean;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: "pending_payment" | "active" | "pending_renewal" | "cancelled" | "lapsed";
  renewal_date?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Stats {
  mrr: number;
  active_subscriptions: number;
  success_rate: number;
  growth_data: { day: string; value: number }[];
  currency: string;
}

