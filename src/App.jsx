import { BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import useIsMobile from "./hooks/useIsMobile";
import BootSequence from "./components/BootSequence";
import AppPC from "./AppPC";
import AppMobile from "./AppMobile";

const App = () => {
  const isMobile = useIsMobile();
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    if (isBooting) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
      document.body.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overflow");
    }
    
    return () => {
      document.body.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overflow");
    };
  }, [isBooting]);

  return (
    <BrowserRouter>
      {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}
      
      {isMobile ? (
        <AppMobile isBooting={isBooting} />
      ) : (
        <AppPC isBooting={isBooting} />
      )}
    </BrowserRouter>
  );
};

export default App;
