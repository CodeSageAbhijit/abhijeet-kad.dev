import React, { useState } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import ExperienceConfessionCard from "./ExperienceConfessionCard";
import { markEasterEggFound } from "../utils/analytics";

const ExperienceCardMobile = ({ experience, index }) => {
  const [unlocked, setUnlocked] = useState(false);

  const toggleUnlock = () => {
    setUnlocked((prev) => {
      const next = !prev;
      if (next) {
        markEasterEggFound(`experience_confession_${experience.id || "card"}`, "click");
      }
      return next;
    });
  };

  return (
    <motion.div
      variants={fadeIn("up", "tween", index * 0.2, 0.5)}
      className="relative mb-8 pb-8 border-b border-accent/20 last:border-b-0 last:mb-0 last:pb-0"
    >
      <div className="flex items-start gap-4 mb-4">
        <button
          type="button"
          onClick={toggleUnlock}
          aria-label={
            unlocked
              ? `Show standard experience for ${experience.company_name}`
              : `Toggle hidden confession for ${experience.company_name}`
          }
          style={{ background: experience.iconBg }}
          className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-accent/50 cursor-pointer p-0"
        >
          <img src={experience.icon} alt={experience.company_name} className="w-full h-full object-cover rounded-full" />
        </button>
        <div>
          <h3 className='text-white text-[18px] font-bold leading-tight'>
            {unlocked ? experience.confessionTitle : experience.title}
          </h3>
          <p className='text-accent/80 text-[12px] font-mono mt-1'>{experience.date}</p>
          <p className='text-secondary text-[14px] font-semibold mt-1'>{experience.company_name}</p>
          {!unlocked && experience.subtitle && (
            <p className="font-mono text-[11px] text-accent/60 mt-1">
              {experience.subtitle}
            </p>
          )}
        </div>
      </div>

      <ExperienceConfessionCard
        experience={experience}
        unlocked={unlocked}
        compact
      />
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
            key={`experience-${experience.id || index}`}
            experience={experience}
            index={index}
          />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(ExperienceMobile, "work", "career");
