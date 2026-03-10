import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

export const Navbar = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 bg-heatmap-light/80 dark:bg-black/80 backdrop-blur-md shadow-lg' : 'py-8'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center text-heatmap-dark dark:text-heatmap-light"
        >
          <Logo className="w-10 h-10" />
        </motion.div>
        
        <div className="flex items-center gap-8">
          <ul className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest">
            {['Work', 'About', 'Contact'].map((item) => (
              <motion.li key={item} whileHover={{ y: -2 }}>
                <a href={`#${item.toLowerCase()}`} className="hover:text-heatmap-red transition-colors">
                  {item}
                </a>
              </motion.li>
            ))}
          </ul>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  );
};
