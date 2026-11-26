import React from "react";
import { motion } from "framer-motion";

import EarthCanvas from "./canvas/Earth";
import CanvasBoundary from "./canvas/CanvasBoundary";
import ContactUplinkForm from "./ContactUplinkForm";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";

const Contact = () => {
  return (
    <div className="xl:mt-12 flex xl:flex-row flex-col-reverse gap-8 overflow-hidden items-stretch">
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="flex-[0.9] flex flex-col"
      >
        <ContactUplinkForm />
      </motion.div>

      <CanvasBoundary>
        <motion.div
          variants={slideIn("right", "tween", 0.2, 1)}
          className="xl:flex-1 xl:h-auto md:h-[580px] h-[420px] mt-4 xl:mt-0"
        >
          <EarthCanvas />
        </motion.div>
      </CanvasBoundary>
    </div>
  );
};

export default SectionWrapper(Contact, "contact", "contact");
