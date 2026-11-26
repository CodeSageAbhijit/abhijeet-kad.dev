import React from "react";
import { motion } from "framer-motion";

import EarthCanvas from "./canvas/Earth";
import CanvasBoundary from "./canvas/CanvasBoundary";
import ContactUplinkForm from "./ContactUplinkForm";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";

const ContactMobile = () => {
  return (
    <div className="flex flex-col gap-6 overflow-hidden items-stretch">
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="flex flex-col w-full"
      >
        <ContactUplinkForm compact />
      </motion.div>

      <CanvasBoundary>
        <div className="w-full h-[360px] mt-2">
          <EarthCanvas />
        </div>
      </CanvasBoundary>
    </div>
  );
};

export default SectionWrapper(ContactMobile, "contact", "contact");
