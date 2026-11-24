import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import TerminalTitleBar from "./TerminalTitleBar";
import emailjs from "@emailjs/browser";

import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import CanvasBoundary from "./canvas/CanvasBoundary";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";

const Contact = () => {
  const formRef = useRef();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          name: form.name,
          email: form.email,
          message: form.message,
          title: `Portfolio Contact from ${form.name}`,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false);
          alert("Thank you. I will get back to you as soon as possible.");

          setForm({
            name: "",
            email: "",
            message: "",
          });
        },
        (error) => {
          setLoading(false);
          console.error(error);

          alert("Ahh, something went wrong. Please try again.");
        }
      );
  };

  return (
    <div className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden items-stretch`}>
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className='flex-[0.9] flex flex-col'
      >
        <p className={styles.sectionSubText}>// Get in touch</p>
        <h3 className={styles.sectionHeadText}>Contact.</h3>

        <div className="term-window flex flex-col mt-8 flex-1">
          <TerminalTitleBar title="abhijeet@portfolio — contact" />

          {/* Terminal Body */}
          <div className='bg-black p-6 flex flex-col gap-5 flex-1'>

            {/* Intro line */}
            {/* <div className='text-accent text-sm'>
              <span className='text-[#888]'>Last login: Sat Mar 7 2026 on ttys000</span>
            </div> */}

            <form ref={formRef} onSubmit={handleSubmit} className='flex flex-col gap-5'>

              {/* Name */}
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-accent'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-accent ml-1'>enter_name</span>
                </div>
                <div className='flex items-center gap-2 bg-black border border-[#424242] rounded px-3 py-2 focus-within:border-accent/60 transition-colors'>
                  <span className='text-accent select-none'>&gt;</span>
                  <input
                    type='text'
                    name='name'
                    value={form.name}
                    onChange={handleChange}
                    placeholder="your name here..."
                    className='flex-1 bg-transparent outline-none text-white placeholder:text-[#929292] text-sm caret-accent'
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-accent'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-accent ml-1'>enter_email</span>
                </div>
                <div className='flex items-center gap-2 bg-black border border-[#424242] rounded px-3 py-2 focus-within:border-accent/60 transition-colors'>
                  <span className='text-accent select-none'>&gt;</span>
                  <input
                    type='email'
                    name='email'
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className='flex-1 bg-transparent outline-none text-white placeholder:text-[#929292] text-sm caret-accent'
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-accent'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-accent ml-1'>enter_message</span>
                </div>
                <div className='flex gap-2 bg-black border border-[#424242] rounded px-3 py-2 focus-within:border-accent/60 transition-colors'>
                  <span className='text-accent select-none mt-0.5'>&gt;</span>
                  <textarea
                    rows={5}
                    name='message'
                    value={form.message}
                    onChange={handleChange}
                    placeholder="type your message..."
                    className='flex-1 bg-transparent outline-none text-white placeholder:text-[#929292] text-sm resize-none caret-accent'
                  />
                </div>
              </div>

              {/* Submit */}
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-accent'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-accent ml-1'>send_message</span>
                </div>
                <button
                  type='submit'
                  className='flex items-center gap-3 bg-black border border-[#525252] hover:border-accent text-accent px-5 py-2 rounded transition-all duration-200 text-sm group'
                >
                  <span className='text-accent'>&gt;</span>
                  <span>{loading ? "Sending..." : "./send --now"}</span>
                  {!loading && (
                    <span className='inline-block w-2 h-4 bg-accent animate-pulse ml-1' />
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </motion.div>

      <CanvasBoundary>
        <motion.div
          variants={slideIn("right", "tween", 0.2, 1)}
          className='xl:flex-1 xl:h-auto md:h-[600px] h-[350px]'
          style={{ marginLeft: "2rem", marginTop: "3rem" }}
        >
          <EarthCanvas />
        </motion.div>
      </CanvasBoundary>
    </div>
  );
};

export default SectionWrapper(Contact, "contact", "contact");
