import React from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const ExperienceCardMobile = ({ experience, index }) => {
  return (
    <motion.div
      variants={fadeIn("up", "tween", index * 0.2, 0.5)}
      className="relative mb-8 pb-8 border-b border-[#9eff00]/20 last:border-b-0 last:mb-0 last:pb-0"
    >
      <div className="flex items-start gap-4 mb-4">
        <div style={{ background: experience.iconBg }} className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-[#9eff00]/50">
          <img
            src={experience.icon}
            alt={experience.company_name}
            className='w-full h-full object-cover rounded-full'
          />
        </div>
        <div>
          <h3 className='text-white text-[18px] font-bold leading-tight'>{experience.title}</h3>
          <p className='text-[#9eff00]/80 text-[12px] font-mono mt-1'>{experience.date}</p>
          <p className='text-secondary text-[14px] font-semibold mt-1'>{experience.company_name}</p>
          {experience.subtitle && (
            <p className="font-mono text-[11px] text-[#9eff00]/60 mt-1">
              {experience.subtitle}
            </p>
          )}
        </div>
      </div>

      <ul className='mt-3 space-y-2'>
        {experience.points.map((point, i) => (
          <li
            key={`experience-point-${i}`}
            className='text-white-100 text-[13px] tracking-wide flex items-start gap-2'
          >
            <span className="text-[#9eff00] mt-1 text-[10px]">▹</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const ExperienceMobile = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} text-left`}>
          // What I have done so far
        </p>
        <h2 className={`${styles.sectionHeadText} text-left`}>
          Experience.
        </h2>
      </motion.div>

      <div className='mt-10 flex flex-col'>
        {experiences.map((experience, index) => (
          <ExperienceCardMobile
            key={`experience-${index}`}
            experience={experience}
            index={index}
          />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(ExperienceMobile, "work");
