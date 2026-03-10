import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Linkedin, Send, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err: any) {
      console.error("Contact form error:", err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-4">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-heatmap-light dark:bg-white/5 border border-heatmap-dark/5 dark:border-white/10 rounded-2xl focus:border-heatmap-red outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-4">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-heatmap-light dark:bg-white/5 border border-heatmap-dark/5 dark:border-white/10 rounded-2xl focus:border-heatmap-red outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-4">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  placeholder="Project Inquiry"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-heatmap-light dark:bg-white/5 border border-heatmap-dark/5 dark:border-white/10 rounded-2xl focus:border-heatmap-red outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-4">Message</label>
                <textarea 
                  rows={4}
                  name="message"
                  required
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-heatmap-light dark:bg-white/5 border border-heatmap-dark/5 dark:border-white/10 rounded-2xl focus:border-heatmap-red outline-none transition-all resize-none"
                />
              </div>

              {status === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 text-green-500 bg-green-500/10 p-4 rounded-2xl"
                >
                  <CheckCircle2 size={20} />
                  <p className="text-sm font-bold">Message sent successfully!</p>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 text-red-500 bg-red-500/10 p-4 rounded-2xl"
                >
                  <AlertCircle size={20} />
                  <p className="text-sm font-bold">{errorMessage}</p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={status === 'loading'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-5 bg-gradient-heatmap text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl transition-opacity ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'} <Send size={20} />
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
