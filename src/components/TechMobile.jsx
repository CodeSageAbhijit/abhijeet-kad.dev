import React from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import { styles } from "../styles";
import { textVariant } from "../utils/motion";

const TechMobile = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText}`}>// Technologies I use</p>
        <h2 className={`${styles.sectionHeadText}`}>Tech Stack.</h2>
      </motion.div>
      <div className='w-full mt-10 grid grid-cols-4 gap-6 place-items-center' style={{ minHeight: 300 }}>
        {technologies.map((tech) => (
          <div key={tech.name} className='flex flex-col items-center justify-center gap-2'>
            <div className='w-16 h-16 rounded-full bg-tertiary flex items-center justify-center border border-white/10 shadow-[0_0_10px_rgba(158,255,0,0.1)]'>
              <img
                src={tech.icon}
                alt={tech.name}
                className='w-10 h-10 object-contain'
              />
            </div>
            <p className='text-[10px] text-secondary tracking-wider text-center'>
              {tech.name}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(TechMobile, "");
