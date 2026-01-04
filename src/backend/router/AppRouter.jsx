import { useMemo } from "react";
import { useRoutes } from "react-router-dom";
import { appRoutes } from "./routes.registry";
import { applyGuards } from "./applyGuards";
import { applyLayouts } from "./applyLayouts";

export default function AppRouter() {
  const finalRoutes = useMemo(() => {
    const guarded = applyGuards(appRoutes);
    return applyLayouts(guarded);
  }, []);

  return useRoutes(finalRoutes);
}
