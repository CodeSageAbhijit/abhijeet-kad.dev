import { SpiritField } from "./spirits/SpiritGuestbook";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import { useGlobalAnalytics } from "./utils/usePortfolioAnalytics";

const Portfolio = lazy(() => import("./Portfolio"));
const RetroStation = lazy(() => import("./retro/RetroStation"));
const EarthCanvas = lazy(() => import("./components/canvas/Earth"));

export default function App() {
  const [hasBooted, setHasBooted] = useState(false);
  useGlobalAnalytics();
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SpiritField><Routes>
        <Route path="/retro" element={
          <Suspense fallback={<div className="fixed inset-0 grid place-items-center bg-primary text-white" role="status">Starting the desktop…</div>}>
            <RetroStation />
          </Suspense>
        } />
        <Route path="/globe" element={
          <Suspense fallback={<div className="fixed inset-0 grid place-items-center bg-[#040812] text-[#00f5ff] font-mono text-xs uppercase tracking-widest" role="status">Initializing Orbital Globe…</div>}>
            <EarthCanvas fullscreenPage />
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={null}>
            <Portfolio isBooting={!hasBooted} onBootComplete={() => setHasBooted(true)} />
          </Suspense>
        } />
      </Routes></SpiritField>
    </BrowserRouter>
  );
}
