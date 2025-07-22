import { create } from "zustand";

type Assumptions = {
  ebit_margin?: number;
  depreciation_pct?: number;
  tax_rate?: number;
  capex_pct?: number;
  wc_change_pct?: number;
  interest_pct?: number;
  growth_x?: number;
  growth_y?: number;
  growth_terminal?: number;
  period_x?: number;
  period_y?: number;
  shares_outstanding?: number;
  net_debt?: number;
  latest_revenue?: number;
  
};

type Store = {
  assumptions: Assumptions;
  setAssumptions: (a: Assumptions) => void;
};

export const useGlobalStore = create<Store>((set) => ({
  assumptions: {},
  setAssumptions: (a) => set({ assumptions: a }),
}));
