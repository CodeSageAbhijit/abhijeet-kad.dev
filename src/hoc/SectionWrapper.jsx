import { motion } from "framer-motion";

import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";

const SECTION_NAME_MAP = {
  about: "about",
  work: "experience",
  skills: "skills",
  projects: "projects",
  contact: "contact",
};

const StarWrapper = (Component, idName, tone) =>
  function HOC(props) {
    return (
      <motion.section
        data-tone={tone}
        data-analytics-section={SECTION_NAME_MAP[idName] || idName}
        variants={staggerContainer()}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true, amount: 0.25 }}
        className={`${styles.padding} max-w-7xl mx-auto relative z-0`}
      >
        <span className='hash-span' id={idName}>
          &nbsp;
        </span>

        <Component {...props} />
      </motion.section>
    );
  };

export default StarWrapper;
