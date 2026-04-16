import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
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

        {/* macOS Terminal Window - Mobile Optimized */}
        <div className='mt-6 rounded-lg overflow-hidden shadow-lg border border-[#9eff00]/20 flex flex-col w-full'
          style={{ fontFamily: "'Share Tech Mono', monospace" }}>
          
          {/* Title Bar */}
          <div className='flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-b border-[#333]'>
            <span className='w-2 h-2 rounded-full bg-[#ff5f57] cursor-pointer hover:opacity-80 transition-opacity' />
            <span className='w-2 h-2 rounded-full bg-[#febc2e] cursor-pointer hover:opacity-80 transition-opacity' />
            <span className='w-2 h-2 rounded-full bg-[#28c840] cursor-pointer hover:opacity-80 transition-opacity' />
            <span className='flex-1 text-center text-[#888] text-xs truncate'>
              abhijeet@portfolio — contact
            </span>
          </div>

          {/* Terminal Body */}
          <div className='bg-[#0d0d0d] p-3 flex flex-col gap-3'>

            {/* Intro line */}
            <div className='text-[#9eff00] text-xs'>
              <span className='text-[#888]'>Last login: Sat Mar 7 2026 on ttys000</span>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className='flex flex-col gap-3'>

              {/* Name */}
              <div>
                <div className='flex items-center gap-1 mb-1 text-xs flex-wrap'>
                  <span className='text-[#28c840]'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-[#9eff00]'>enter_name</span>
                </div>
                <div className='flex items-center gap-1 bg-[#111] border border-[#9eff00]/20 rounded px-2 py-1 focus-within:border-[#9eff00]/60 transition-colors'>
                  <span className='text-[#9eff00] select-none text-xs'>&gt;</span>
                  <input
                    type='text'
                    name='name'
                    value={form.name}
                    onChange={handleChange}
                    placeholder="your name..."
                    className='flex-1 bg-transparent outline-none text-white placeholder:text-[#444] text-xs caret-[#9eff00]'
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className='flex items-center gap-1 mb-1 text-xs flex-wrap'>
                  <span className='text-[#28c840]'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-[#9eff00]'>enter_email</span>
                </div>
                <div className='flex items-center gap-1 bg-[#111] border border-[#9eff00]/20 rounded px-2 py-1 focus-within:border-[#9eff00]/60 transition-colors'>
                  <span className='text-[#9eff00] select-none text-xs'>&gt;</span>
                  <input
                    type='email'
                    name='email'
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className='flex-1 bg-transparent outline-none text-white placeholder:text-[#444] text-xs caret-[#9eff00]'
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <div className='flex items-center gap-1 mb-1 text-xs flex-wrap'>
                  <span className='text-[#28c840]'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-[#9eff00]'>enter_message</span>
                </div>
                <div className='flex gap-1 bg-[#111] border border-[#9eff00]/20 rounded px-2 py-1 focus-within:border-[#9eff00]/60 transition-colors'>
                  <span className='text-[#9eff00] select-none text-xs flex-shrink-0'>&gt;</span>
                  <textarea
                    rows={3}
                    name='message'
                    value={form.message}
                    onChange={handleChange}
                    placeholder="type your message..."
                    className='flex-1 bg-transparent outline-none text-white placeholder:text-[#444] text-xs resize-none caret-[#9eff00]'
                  />
                </div>
              </div>

              {/* Submit */}
              <div>
                <div className='flex items-center gap-1 mb-1 text-xs flex-wrap'>
                  <span className='text-[#28c840]'>abhijeet@portfolio</span>
                  <span className='text-white'>:</span>
                  <span className='text-[#4fc3f7]'>~</span>
                  <span className='text-white'>$</span>
                  <span className='text-[#9eff00]'>send_message</span>
                </div>
                <button
                  type='submit'
                  className='flex items-center gap-2 bg-[#111] border border-[#9eff00]/40 hover:border-[#9eff00] hover:bg-[#9eff00]/10 text-[#9eff00] px-3 py-1 rounded transition-all duration-200 text-xs group w-full justify-center'
                >
                  <span className='text-[#9eff00]'>&gt;</span>
                  <span>{loading ? "Sending..." : "./send --now"}</span>
                  {!loading && (
                    <span className='inline-block w-1.5 h-3 bg-[#9eff00] animate-pulse' />
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

export default SectionWrapper(ContactMobile, "contact");

