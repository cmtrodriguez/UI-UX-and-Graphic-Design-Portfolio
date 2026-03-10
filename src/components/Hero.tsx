import React from 'react';
import { motion } from 'motion/react';
import { MousePointer2 } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20 bg-heatmap-light dark:bg-black transition-colors duration-500">
      {/* Background Heatmap Gradients */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-heatmap-blue/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-heatmap-red/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            x: [-50, 50, -50],
            y: [50, -50, 50]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-heatmap-yellow/20 rounded-full blur-[120px]" 
        />
      </div>

      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-9xl font-bold tracking-tighter leading-none mb-6"
          >
            <span className="block">CHRISTIAN</span>
            <span className="text-gradient-heatmap">RODRIGUEZ</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-2xl font-medium uppercase tracking-[0.3em] opacity-70 mb-8 md:mb-12"
          >
            Graphic Designer <span className="text-heatmap-red mx-2">&</span> UI/UX Designer
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a 
              href="#work" 
              className="px-8 py-4 bg-heatmap-dark dark:bg-heatmap-light text-heatmap-light dark:text-heatmap-dark rounded-full font-bold uppercase tracking-widest hover:bg-heatmap-red dark:hover:bg-heatmap-red hover:text-white dark:hover:text-white transition-all duration-300"
            >
              View My Work
            </a>
            <a 
              href="#contact" 
              className="px-8 py-4 border-2 border-heatmap-dark dark:border-heatmap-light rounded-full font-bold uppercase tracking-widest hover:border-heatmap-red hover:text-heatmap-red transition-all duration-300"
            >
              Let's Talk
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] opacity-50">Scroll</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-[1px] h-12 bg-gradient-to-b from-heatmap-red to-transparent"
        />
      </motion.div>
    </section>
  );
};
