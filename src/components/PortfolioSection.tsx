import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECTS as STATIC_PROJECTS } from '../constants';
import { Project } from '../types';
import { X, ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export const PortfolioSection = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [projects, setProjects] = useState<Project[]>(STATIC_PROJECTS);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.length > 0) {
          setProjects([...data, ...STATIC_PROJECTS]);
        }
      } catch (e) {
        console.error("Failed to fetch dynamic projects", e);
      }
    };
    fetchProjects();
  }, []);

  const categories = ['All', 'Graphic Design', 'UI/UX Design', 'Layout Design'];
  
  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <section id="work" className="py-16 md:py-24 bg-white dark:bg-black transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-16 gap-8">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-7xl font-bold tracking-tighter mb-4"
            >
              SELECTED <span className="text-gradient-heatmap">WORKS</span>
            </motion.h2>
            <p className="text-lg opacity-60 max-w-md dark:text-white/60">
              A collection of projects that define my creative journey and technical expertise.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  filter === cat 
                    ? 'bg-heatmap-red text-white' 
                    : 'bg-heatmap-light dark:bg-white/5 dark:text-white hover:bg-heatmap-yellow hover:text-heatmap-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {filter === 'UI/UX Design' ? (
              <CarouselLayout 
                key="carousel"
                projects={filteredProjects} 
                onSelect={setSelectedProject} 
              />
            ) : filter === 'Graphic Design' || filter === 'Layout Design' ? (
              <CollageLayout 
                key="collage"
                projects={filteredProjects} 
                onSelect={setSelectedProject} 
              />
            ) : (
              <GridLayout 
                key="grid"
                projects={filteredProjects} 
                onSelect={setSelectedProject} 
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};

// --- Layout Components ---

const GridLayout = ({ projects, onSelect }: { projects: Project[], onSelect: (p: Project) => void, key?: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
  >
    {projects.map((project) => (
      <ProjectCard 
        key={project.id} 
        project={project} 
        onClick={() => onSelect(project)} 
      />
    ))}
  </motion.div>
);

const CollageLayout = ({ projects, onSelect }: { projects: Project[], onSelect: (p: Project) => void, key?: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[300px]"
  >
    {projects.map((project, i) => (
      <motion.div
        key={project.id}
        whileHover={{ scale: 0.98 }}
        onClick={() => onSelect(project)}
        className={`relative overflow-hidden rounded-3xl cursor-pointer group ${
          i % 3 === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1'
        }`}
      >
        <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
          <h3 className="text-xl font-bold text-white">{project.title}</h3>
          <p className="text-xs text-heatmap-yellow font-bold uppercase tracking-widest">{project.category}</p>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const CarouselLayout = ({ projects, onSelect }: { projects: Project[], onSelect: (p: Project) => void, key?: string }) => {
  const [index, setIndex] = useState(0);
  
  const next = () => setIndex((prev) => (prev + 1) % projects.length);
  const prev = () => setIndex((prev) => (prev - 1 + projects.length) % projects.length);

  if (projects.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-[600px] flex items-center justify-center"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className="w-full max-w-4xl glass-card rounded-[3rem] overflow-hidden grid grid-cols-1 md:grid-cols-2 h-full"
        >
          <div className="h-full">
            <img src={projects[index].image} alt={projects[index].title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="p-12 flex flex-col justify-center">
            <span className="text-sm font-bold text-heatmap-red uppercase tracking-[0.4em] mb-4">{projects[index].category}</span>
            <h3 className="text-5xl font-bold mb-6 tracking-tighter dark:text-white">{projects[index].title}</h3>
            <p className="text-lg opacity-70 mb-8 dark:text-white/70">{projects[index].description}</p>
            <button 
              onClick={() => onSelect(projects[index])}
              className="self-start px-8 py-4 bg-heatmap-dark dark:bg-white text-white dark:text-black rounded-full font-bold uppercase tracking-widest hover:bg-heatmap-red transition-colors"
            >
              View Case Study
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
        <button onClick={prev} className="p-4 rounded-full glass-card hover:bg-heatmap-red hover:text-white transition-all dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <button onClick={next} className="p-4 rounded-full glass-card hover:bg-heatmap-red hover:text-white transition-all dark:text-white">
          <ChevronRight size={24} />
        </button>
      </div>
    </motion.div>
  );
};

// --- Helper Components ---

const ProjectCard = ({ project, onClick }: { project: Project, onClick: () => void, key?: string }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="group relative aspect-[4/5] overflow-hidden rounded-3xl cursor-pointer bg-heatmap-light dark:bg-white/5"
    >
      <img 
        src={project.image} 
        alt={project.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        referrerPolicy="no-referrer"
      />
      
      <div className="absolute inset-0 bg-linear-to-t from-heatmap-dark/90 via-heatmap-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
        <motion.span 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="text-xs font-bold uppercase tracking-[0.3em] text-heatmap-yellow mb-2"
        >
          {project.category}
        </motion.span>
        <h3 className="text-3xl font-bold text-white mb-4 tracking-tighter">{project.title}</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tools.slice(0, 3).map(tool => (
            <span key={tool} className="text-[10px] px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/80 uppercase tracking-widest">
              {tool}
            </span>
          ))}
        </div>
        <button className="w-12 h-12 rounded-full bg-heatmap-red text-white flex items-center justify-center self-end group-hover:scale-110 transition-transform">
          <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
};

const ProjectModal = ({ project, onClose }: { project: Project, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-6xl max-h-full overflow-y-auto bg-heatmap-light dark:bg-black rounded-[2rem] shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-10 p-4 bg-heatmap-red text-white rounded-full hover:scale-110 transition-transform"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="h-[400px] lg:h-auto">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="p-8 md:p-16">
            <span className="text-sm font-bold text-heatmap-red uppercase tracking-[0.4em] mb-4 block">
              {project.category}
            </span>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 dark:text-white">{project.title}</h2>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2 dark:text-white/50">Description</h4>
                <p className="text-lg leading-relaxed opacity-80 dark:text-white/80">{project.description}</p>
              </div>

              {project.case_study_content && (
                <div className="pt-8 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 dark:text-white/50">Case Study</h4>
                  <div className="prose prose-invert max-w-none text-white/80">
                    <div className="whitespace-pre-wrap">{project.case_study_content}</div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 dark:text-white/50">Tools Used</h4>
                <div className="flex flex-wrap gap-3">
                  {project.tools.map(tool => (
                    <span key={tool} className="px-4 py-2 bg-heatmap-blue/10 dark:bg-white/5 rounded-full text-xs font-bold uppercase tracking-widest dark:text-white">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button className="flex items-center gap-4 px-8 py-4 bg-heatmap-dark dark:bg-white text-white dark:text-black rounded-full font-bold uppercase tracking-widest hover:bg-heatmap-red transition-all">
                  View Live Project <ExternalLink size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
