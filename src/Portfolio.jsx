import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppMobile from "./AppMobile";
import AppPC from "./AppPC";
import BootSequence from "./components/BootSequence";
import useIsMobile from "./hooks/useIsMobile";

export default function Portfolio({ isBooting, onBootComplete }) {
  const isMobile = useIsMobile();
  const { hash } = useLocation();

  useEffect(() => {
    if (!isBooting) return;
    document.documentElement.classList.add("classic-busy");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.classList.remove("classic-busy");
      document.body.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overflow");
    };
  }, [isBooting]);

  useEffect(() => {
    if (isBooting || !["#search", "#work", "#contact"].includes(hash)) return;
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "instant" }));
    return () => cancelAnimationFrame(frame);
  }, [hash, isBooting]);

  return (
    <>
      {isBooting && <BootSequence onComplete={onBootComplete} />}
      {isMobile ? <AppMobile isBooting={isBooting} /> : <AppPC isBooting={isBooting} />}
    </>
  );
}
