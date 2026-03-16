import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

const useIsMobile = (breakpoint = MOBILE_BREAKPOINT) => {
  const getIsMobile = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  };

  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const onResize = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
