import React from 'react';
import { motion } from 'motion/react';
import { SKILLS, EXPERIENCES, TOOLS } from '../constants';
import { Download, Briefcase, Code, Palette } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-heatmap-light dark:bg-black transition-colors duration-500 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-heatmap-blue/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-heatmap-red/10 rounded-full blur-[100px]" />
            
            <div className="relative aspect-square rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-2xl">
              <img 
                src="https://picsum.photos/seed/christian/800/800" 
                alt="Christian Rodriguez" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-heatmap opacity-20 mix-blend-overlay" />
            </div>

            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-10 p-8 glass-card rounded-3xl shadow-xl max-w-[200px]"
            >
              <p className="text-4xl font-bold text-heatmap-red mb-1">8+</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">Years of Creative Experience</p>
            </motion.div>
          </motion.div>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-6">
                about <span className="text-gradient-heatmap">me</span>
              </h2>
              <p className="text-xl leading-relaxed opacity-80">
                Hello! My name is Christian. I'm a Computer Science student with strong strengths in UI/UX, digital platforms, and business-focused problem solving. I design user-centered solutions across healthcare, compliance, and e-commerce.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-heatmap-blue">Skills</h3>
                <div className="space-y-4">
                  {SKILLS.map(skill => (
                    <div key={skill.name}>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="h-1 w-full bg-heatmap-dark/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-gradient-heatmap"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-heatmap-red">Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {TOOLS.map(tool => (
                    <span key={tool} className="px-4 py-2 bg-white dark:bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border border-heatmap-dark/5 dark:border-white/5">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <a 
                href="/resume.pdf" 
                download="Christian_Rodriguez_Resume.pdf"
                className="flex items-center gap-4 px-10 py-5 bg-heatmap-dark dark:bg-heatmap-light text-heatmap-light dark:text-heatmap-dark rounded-full font-bold uppercase tracking-widest hover:bg-heatmap-red dark:hover:bg-heatmap-red hover:text-white dark:hover:text-white transition-all shadow-xl"
              >
                Download Resume <Download size={20} />
              </a>
            </motion.div>
          </div>
        </div>

        {/* Experience Timeline */}
        <div className="mt-16 md:mt-32">
          <h3 className="text-xs font-bold uppercase tracking-[0.5em] text-center mb-10 md:mb-16 opacity-50">Work Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {EXPERIENCES.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 glass-card rounded-[2rem] hover:border-heatmap-red transition-colors duration-500"
              >
                <span className="text-[10px] font-bold text-heatmap-red uppercase tracking-widest mb-4 block">{exp.period}</span>
                <h4 className="text-2xl font-bold tracking-tight mb-2">{exp.role}</h4>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4">{exp.company}</p>
                <p className="text-sm opacity-70 leading-relaxed">{exp.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
