import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import useIsMobile from "./hooks/useIsMobile";
import BootSequence from "./components/BootSequence";
import AppPC from "./AppPC";
import AppMobile from "./AppMobile";

const RetroDesktop = lazy(() => import("./retro/RetroDesktop"));

function Portfolio({ isBooting, onBootComplete }) {
  const isMobile = useIsMobile();
  const { hash } = useLocation();

  useEffect(() => {
    if (!isBooting) return;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overflow");
    };
  }, [isBooting]);

  useEffect(() => {
    if (isBooting || hash !== "#search") return;
    const frame = requestAnimationFrame(() => document.getElementById("search")?.scrollIntoView({ behavior: "instant" }));
    return () => cancelAnimationFrame(frame);
  }, [hash, isBooting]);

  return (
    <>
      {isBooting && <BootSequence onComplete={onBootComplete} />}
      {isMobile ? <AppMobile isBooting={isBooting} /> : <AppPC isBooting={isBooting} />}
    </>
  );
}

export default function App() {
  const [hasBooted, setHasBooted] = useState(false);
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/retro" element={
          <Suspense fallback={<div className="fixed inset-0 grid place-items-center bg-primary text-white" role="status">Starting the desktop…</div>}>
            <RetroDesktop />
          </Suspense>
        } />
        <Route path="*" element={<Portfolio isBooting={!hasBooted} onBootComplete={() => setHasBooted(true)} />} />
      </Routes>
    </BrowserRouter>
  );
}
