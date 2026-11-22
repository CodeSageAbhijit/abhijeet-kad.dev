import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useState } from "react";

const Portfolio = lazy(() => import("./Portfolio"));
const RetroStation = lazy(() => import("./retro/RetroStation"));

export default function App() {
  const [hasBooted, setHasBooted] = useState(false);
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/retro" element={
          <Suspense fallback={<div className="fixed inset-0 grid place-items-center bg-primary text-white" role="status">Starting the desktop…</div>}>
            <RetroStation />
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={null}>
            <Portfolio isBooting={!hasBooted} onBootComplete={() => setHasBooted(true)} />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  );
}
