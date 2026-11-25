import React, { useState } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { motion } from "framer-motion";

import "react-vertical-timeline-component/style.min.css";

import { styles } from "../styles";
import { experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { textVariant } from "../utils/motion";
import ExperienceConfessionCard from "./ExperienceConfessionCard";
import { markEasterEggFound } from "../utils/analytics";

const ExperienceCard = ({ experience }) => {
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
    <VerticalTimelineElement
      contentStyle={{
        background: "var(--panel)",
        color: "#fff",
        borderTop: "3px solid rgb(var(--accent-rgb) / 0.5)",
      }}
      contentArrowStyle={{ borderRight: "7px solid var(--panel)" }}
      date={experience.date}
      iconStyle={{ background: experience.iconBg }}
      icon={
        <button
          type="button"
          onClick={toggleUnlock}
          aria-label={
            unlocked
              ? `Show standard experience for ${experience.company_name}`
              : `Toggle hidden confession for ${experience.company_name}`
          }
          title="Click logo to switch story"
          className="w-full h-full rounded-full overflow-hidden cursor-pointer border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <img
            src={experience.icon}
            alt={experience.company_name}
            className="w-full h-full object-cover rounded-full transition-transform duration-200 hover:scale-105"
          />
        </button>
      }
    >
      <ExperienceConfessionCard experience={experience} unlocked={unlocked} />
    </VerticalTimelineElement>
  );
};

const Experience = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} text-center`}>
          // What I have done so far
        </p>
        <h2 className={`${styles.sectionHeadText} text-center`}>
          Work Experience.
        </h2>
      </motion.div>

      <div className='mt-20 flex flex-col'>
        <VerticalTimeline>
          {experiences.map((experience, index) => (
            <ExperienceCard
              key={`experience-${experience.id || index}`}
              experience={experience}
            />
          ))}
        </VerticalTimeline>
      </div>
    </>
  );
};

export default SectionWrapper(Experience, "work", "career");
