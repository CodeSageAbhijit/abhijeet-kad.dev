import React from "react";

import TechBubblesCanvas from "./canvas/TechBubbles";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";

const Tech = () => {
  return (
    <div className='w-full' style={{ minHeight: 680 }}>
      <div style={{ width: "100%", height: 560 }}>
      <TechBubblesCanvas technologies={technologies} />
      </div>
    </div>
  );
};

export default SectionWrapper(Tech, "");
