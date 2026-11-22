import React from "react";
import { motion } from "framer-motion";

import TechBubblesCanvas from "./canvas/TechBubbles";
import CanvasBoundary from "./canvas/CanvasBoundary";
import { TechIcons } from "./TechMobile";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import { styles } from "../styles";
import { textVariant } from "../utils/motion";

const Tech = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText}`}>// Technologies I use</p>
        <h2 className={`${styles.sectionHeadText}`}>Tech Stack.</h2>
      </motion.div>
      <CanvasBoundary fallback={<TechIcons />}>
        <div className='w-full mt-10' style={{ minHeight: 680 }}>
          <div style={{ width: "100%", height: 560 }}>
            <TechBubblesCanvas technologies={technologies} />
          </div>
        </div>
      </CanvasBoundary>
    </>
  );
};

export default SectionWrapper(Tech, "skills", "tools");
