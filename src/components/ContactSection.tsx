import React from 'react';
import { motion } from 'motion/react';
import { Mail, Linkedin, Send, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';

export const ContactSection = () => {
  return (
    <section id="contact" className="py-16 md:py-24 bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-8xl font-bold tracking-tighter mb-8"
            >
              LET'S <span className="text-gradient-heatmap">CONNECT</span>
            </motion.h2>
            <p className="text-xl opacity-60 mb-12 max-w-md">
              Have a project in mind or just want to say hi? I'm always open to new opportunities and collaborations.
            </p>

            <div className="space-y-8">
              <ContactLink icon={<Mail size={24} />} label="Email" value="rodriguez.cmt7@gmail.com" href="mailto:rodriguez.cmt7@gmail.com" />
              <ContactLink icon={<Linkedin size={24} />} label="LinkedIn" value="christianmtrodriguez" href="https://linkedin.com/in/christianmtrodriguez/" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-8 md:p-12 glass-card rounded-[3rem] shadow-2xl relative"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-heatmap-yellow/20 rounded-full blur-[50px]" />
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-4">Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full px-6 py-4 bg-heatmap-light dark:bg-white/5 border border-heatmap-dark/5 dark:border-white/10 rounded-2xl focus:border-heatmap-red outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-4">Email</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full px-6 py-4 bg-heatmap-light dark:bg-white/5 border border-heatmap-dark/5 dark:border-white/10 rounded-2xl focus:border-heatmap-red outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-4">Subject</label>
                <input 
                  type="text" 
                  placeholder="Project Inquiry"
                  className="w-full px-6 py-4 bg-heatmap-light dark:bg-white/5 border border-heatmap-dark/5 dark:border-white/10 rounded-2xl focus:border-heatmap-red outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-4">Message</label>
                <textarea 
                  rows={4}
                  placeholder="Tell me about your project..."
                  className="w-full px-6 py-4 bg-heatmap-light dark:bg-white/5 border border-heatmap-dark/5 dark:border-white/10 rounded-2xl focus:border-heatmap-red outline-none transition-all resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-gradient-heatmap text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl"
              >
                Send Message <Send size={20} />
              </motion.button>
            </form>
          </motion.div>
        </div>

        <div className="mt-16 md:mt-32 pt-12 border-t border-heatmap-dark/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo className="w-12 h-12" />
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest opacity-50">
            <a href="#" className="hover:text-heatmap-red transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-heatmap-red transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactLink = ({ icon, label, value, href }: { icon: React.ReactNode, label: string, value: string, href: string }) => (
  <motion.a
    href={href}
    whileHover={{ x: 10 }}
    className="flex items-center gap-6 group"
  >
    <div className="w-14 h-14 rounded-2xl bg-heatmap-light dark:bg-white/5 flex items-center justify-center group-hover:bg-heatmap-red group-hover:text-white transition-all duration-300">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">{label}</p>
      <p className="text-xl font-bold tracking-tight flex items-center gap-2">
        {value} <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </p>
    </div>
  </motion.a>
);
