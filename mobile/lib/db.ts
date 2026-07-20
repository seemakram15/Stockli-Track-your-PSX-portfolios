import { supabase } from "./supabase";

export interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  cost_basis: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  portfolio_id: string;
  user_id: string;
  symbol: string;
  type: "BUY" | "SELL" | "ADD" | "EDIT" | "REMOVE";
  quantity: number;
  price: number;
  commission: number;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  user_id: string;
  symbol: string;
  notes: string | null;
  created_at: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  symbol: string;
  condition: "ABOVE" | "BELOW";
  price: number;
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export const db = {
  portfolios: {
    list: async (): Promise<Portfolio[]> => {
      const { data, error } = await supabase.from("portfolios").select("*").order("created_at");
      if (error) throw error;
      return data ?? [];
    },

    create: async (name: string, description?: string): Promise<Portfolio> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("portfolios")
        .insert({ name, description: description ?? null, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from("portfolios").delete().eq("id", id);
      if (error) throw error;
    },
  },

  holdings: {
    forPortfolio: async (portfolioId: string): Promise<Holding[]> => {
      const { data, error } = await supabase
        .from("holdings")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .order("symbol");
      if (error) throw error;
      return data ?? [];
    },

    all: async (): Promise<Holding[]> => {
      const { data, error } = await supabase.from("holdings").select("*").order("symbol");
      if (error) throw error;
      return data ?? [];
    },
  },

  transactions: {
    forPortfolio: async (portfolioId: string): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },

    forHolding: async (portfolioId: string, symbol: string): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .eq("symbol", symbol)
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },

    add: async (tx: Omit<Transaction, "id" | "created_at">): Promise<Transaction> => {
      const { data, error } = await supabase
        .from("transactions")
        .insert(tx)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  watchlists: {
    list: async (): Promise<(Watchlist & { items: WatchlistItem[] })[]> => {
      const { data, error } = await supabase
        .from("watchlists")
        .select("*, watchlist_items(*)")
        .order("created_at");
      if (error) throw error;
      return (data ?? []).map((w) => ({ ...w, items: w.watchlist_items ?? [] }));
    },

    addItem: async (watchlistId: string, symbol: string): Promise<WatchlistItem> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("watchlist_items")
        .insert({ watchlist_id: watchlistId, symbol, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    removeItem: async (itemId: string): Promise<void> => {
      const { error } = await supabase.from("watchlist_items").delete().eq("id", itemId);
      if (error) throw error;
    },
  },

  alerts: {
    list: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },

    create: async (symbol: string, condition: "ABOVE" | "BELOW", price: number): Promise<Alert> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("alerts")
        .insert({ symbol, condition, price, is_active: true, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from("alerts").delete().eq("id", id);
      if (error) throw error;
    },
  },
};
