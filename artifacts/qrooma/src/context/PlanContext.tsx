import { createContext, useContext, useState, type ReactNode } from "react";

export type Plan = "free" | "connect" | "pro";

interface PlanContextValue {
  plan: Plan;
  setPlan: (p: Plan) => void;
}

const PlanContext = createContext<PlanContextValue>({
  plan: "connect",
  setPlan: () => {},
});

const STORAGE_KEY = "qrooma_plan";

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<Plan>(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    return (s === "free" || s === "connect" || s === "pro") ? s : "connect";
  });

  function setPlan(p: Plan) {
    setPlanState(p);
    localStorage.setItem(STORAGE_KEY, p);
  }

  return (
    <PlanContext.Provider value={{ plan, setPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
