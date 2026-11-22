import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import TerminalTitleBar from "./TerminalTitleBar";
import emailjs from "@emailjs/browser";

import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";

const ContactMobile = () => {
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
    <div className='flex flex-col gap-6 overflow-hidden items-stretch'>
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className='flex flex-col w-full'
      >
        <p className={styles.sectionSubText}>// Get in touch</p>
        <h3 className={styles.sectionHeadText}>Contact.</h3>

        <div className="term-window flex flex-col mt-6 w-full">
          <TerminalTitleBar title="abhijeet@portfolio — contact" />

          {/* Terminal Body */}
          <div className='bg-black p-3 flex flex-col gap-3'>

            {/* Intro line */}
            <div className='text-accent text-xs'>
              <span className='text-[#888]'>Last login: Sat Mar 7 2026 on ttys000</span>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className='flex flex-col gap-3'>

              {/* Name */}
              <div>
                <div className='flex items-center gap-1 mb-1 text-xs flex-wrap'>
                  <span className='text-accent'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-accent'>enter_name</span>
                </div>
                <div className='flex items-center gap-1 bg-black border border-[#424242] rounded px-2 py-1 focus-within:border-accent/60 transition-colors'>
                  <span className='text-accent select-none text-xs'>&gt;</span>
                  <input
                    type='text'
                    name='name'
                    value={form.name}
                    onChange={handleChange}
                    placeholder="your name..."
                    className='flex-1 bg-transparent outline-none text-white placeholder:text-[#929292] text-xs caret-accent'
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className='flex items-center gap-1 mb-1 text-xs flex-wrap'>
                  <span className='text-accent'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-accent'>enter_email</span>
                </div>
                <div className='flex items-center gap-1 bg-black border border-[#424242] rounded px-2 py-1 focus-within:border-accent/60 transition-colors'>
                  <span className='text-accent select-none text-xs'>&gt;</span>
                  <input
                    type='email'
                    name='email'
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className='flex-1 bg-transparent outline-none text-white placeholder:text-[#929292] text-xs caret-accent'
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <div className='flex items-center gap-1 mb-1 text-xs flex-wrap'>
                  <span className='text-accent'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-accent'>enter_message</span>
                </div>
                <div className='flex gap-1 bg-black border border-[#424242] rounded px-2 py-1 focus-within:border-accent/60 transition-colors'>
                  <span className='text-accent select-none text-xs flex-shrink-0'>&gt;</span>
                  <textarea
                    rows={3}
                    name='message'
                    value={form.message}
                    onChange={handleChange}
                    placeholder="type your message..."
                    className='flex-1 bg-transparent outline-none text-white placeholder:text-[#929292] text-xs resize-none caret-accent'
                  />
                </div>
              </div>

              {/* Submit */}
              <div>
                <div className='flex items-center gap-1 mb-1 text-xs flex-wrap'>
                  <span className='text-accent'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-accent'>send_message</span>
                </div>
                <button
                  type='submit'
                  className='flex items-center gap-2 bg-black border border-[#525252] hover:border-accent text-accent px-3 py-1 rounded transition-all duration-200 text-xs group w-full justify-center'
                >
                  <span className='text-accent'>&gt;</span>
                  <span>{loading ? "Sending..." : "./send --now"}</span>
                  {!loading && (
                    <span className='inline-block w-1.5 h-3 bg-accent animate-pulse' />
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SectionWrapper(ContactMobile, "contact", "contact");

