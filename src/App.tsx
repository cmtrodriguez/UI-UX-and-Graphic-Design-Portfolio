import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PortfolioSection } from './components/PortfolioSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { AdminDashboard } from './components/AdminDashboard';
import { Logo } from './components/Logo';

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[1000] bg-heatmap-dark flex flex-col items-center justify-center dark"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-white mb-8"
      >
        <Logo className="w-20 h-20" />
      </motion.div>
      
      <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-heatmap"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="mt-4 text-[10px] font-bold text-white/50 uppercase tracking-[0.5em]">
        Loading {progress}%
      </div>
    </motion.div>
  );
};

const MainSite = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    <Navbar />
    <main>
      <Hero />
      <PortfolioSection />
      <AboutSection />
      <ContactSection />
    </main>
    <footer className="py-12 bg-heatmap-light dark:bg-black text-center border-t border-heatmap-dark/5 dark:border-white/5">
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="inline-block cursor-pointer mb-8"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <div className="w-12 h-12 rounded-full border-2 border-heatmap-red flex items-center justify-center text-heatmap-red">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6"/>
          </svg>
        </div>
      </motion.div>
      <div className="flex flex-col items-center gap-4">
        <Logo className="w-12 h-12" />
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-30 dark:text-white/30">
          Designed & Built with Passion
        </p>
      </div>
    </footer>
  </motion.div>
);

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <Router>
      <div className="relative font-sans antialiased">
        <AnimatePresence>
          {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
        </AnimatePresence>

        {!loading && (
          <Routes>
            <Route path="/" element={<MainSite />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}
