import React, { useState, useEffect, useMemo } from 'react';
import { Project } from '../types';
import { 
  Plus, Trash2, LogOut, Save, Eye, EyeOff, Search, 
  Filter, LayoutGrid, List, ChevronRight, X, AlertCircle,
  BarChart3, CheckCircle2, Clock, Image as ImageIcon, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard = () => {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    category: 'Graphic Design',
    description: '',
    tools: [],
    tags: [],
    image: '',
    color: '#FF3300',
    status: 'Published',
    case_study_content: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProjects();
    }
  }, [isLoggedIn]);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects?admin=true');
    const data = await res.json();
    setProjects(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      setIsLoggedIn(true);
    } else {
      alert('Invalid admin password. Please check your environment variables.');
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const project = { ...newProject, id: Date.now().toString() };
    
    const formData = new FormData();
    formData.append('password', password);
    formData.append('project', JSON.stringify(project));
    if (selectedFile) {
      formData.append('imageFile', selectedFile);
    }

    const res = await fetch('/api/projects', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      fetchProjects();
      setIsAddModalOpen(false);
      setSelectedFile(null);
      setNewProject({
        title: '',
        category: 'Graphic Design',
        description: '',
        tools: [],
        tags: [],
        image: '',
        color: '#FF3300',
        status: 'Published',
        case_study_content: ''
      });
    } else {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      alert(`Failed to add project: ${errorData.error || 'Check password or server logs.'}`);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Published' ? 'Hidden' : 'Published';
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, status: newStatus })
    });

    if (res.ok) {
      fetchProjects();
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const res = await fetch(`/api/projects/${deleteConfirmId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      setDeleteConfirmId(null);
      fetchProjects();
    }
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: projects.length,
      graphic: projects.filter(p => p.category === 'Graphic Design').length,
      uiux: projects.filter(p => p.category === 'UI/UX Design').length,
      published: projects.filter(p => p.status === 'Published').length,
      hidden: projects.filter(p => p.status === 'Hidden').length,
    };
  }, [projects]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [projects, searchQuery, filterCategory, filterStatus]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin} 
          className="p-10 glass-card rounded-[2.5rem] w-full max-w-md border border-white/10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-heatmap rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h2>
            <p className="text-white/50 text-sm mt-2">Enter your credentials to manage your portfolio</p>
          </div>
          
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-heatmap-red transition-all"
            />
            <button className="w-full py-4 bg-gradient-heatmap text-white rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-heatmap-red/20">
              Unlock Dashboard
            </button>
          </div>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-heatmap-light dark:bg-black p-4 md:p-8 pt-24 transition-colors duration-500">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold dark:text-white tracking-tighter">Portfolio <span className="text-gradient-heatmap">Manager</span></h1>
            <p className="text-heatmap-dark/50 dark:text-white/50 mt-2 font-medium">Control your public presence and showcase your best work.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-heatmap-red text-white rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-heatmap-red/30"
            >
              <Plus size={20} /> New Project
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="p-3 glass-card rounded-full text-heatmap-dark dark:text-white hover:text-heatmap-red transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <StatCard icon={<BarChart3 size={20} />} label="Total" value={stats.total} color="blue" />
          <StatCard icon={<ImageIcon size={20} />} label="Graphic" value={stats.graphic} color="yellow" />
          <StatCard icon={<LayoutGrid size={20} />} label="UI/UX" value={stats.uiux} color="red" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Published" value={stats.published} color="green" />
          <StatCard icon={<EyeOff size={20} />} label="Hidden" value={stats.hidden} color="gray" />
        </div>

        {/* Controls */}
        <div className="glass-card rounded-[2rem] p-6 mb-8 flex flex-col lg:flex-row justify-between items-center gap-6 border border-white/5">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-full dark:text-white outline-none focus:border-heatmap-red transition-all"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-heatmap-red text-white shadow-lg' : 'text-white/50'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-full transition-all ${viewMode === 'table' ? 'bg-heatmap-red text-white shadow-lg' : 'text-white/50'}`}
              >
                <List size={18} />
              </button>
            </div>

            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full dark:text-white outline-none text-sm font-bold uppercase tracking-widest"
            >
              <option value="All">All Categories</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Layout Design">Layout Design</option>
            </select>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full dark:text-white outline-none text-sm font-bold uppercase tracking-widest"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
        </div>

        {/* Projects List */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProjects.map(project => (
                <ProjectAdminCard 
                  key={project.id} 
                  project={project} 
                  onToggleStatus={toggleStatus}
                  onDelete={() => setDeleteConfirmId(project.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-[2rem] overflow-hidden border border-white/5"
            >
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50">Project</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50">Category</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50">Date</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <img src={project.image} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold dark:text-white">{project.title}</p>
                            <p className="text-xs text-white/40 line-clamp-1 max-w-[200px]">{project.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full dark:text-white/70">
                          {project.category}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <StatusBadge status={project.status || 'Published'} />
                      </td>
                      <td className="px-8 py-4 text-xs text-white/40">
                        {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => toggleStatus(project.id, project.status || 'Published')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-heatmap-red"
                          >
                            {project.status === 'Hidden' ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(project.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-white/50 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-heatmap-light dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-2xl font-bold dark:text-white">Create New Project</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-white/50">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddProject} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Project Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Minimalist Brand Identity" 
                      value={newProject.title}
                      onChange={e => setNewProject({...newProject, title: e.target.value})}
                      className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl dark:text-white outline-none focus:border-heatmap-red"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Category</label>
                    <select 
                      value={newProject.category}
                      onChange={e => setNewProject({...newProject, category: e.target.value as any})}
                      className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl dark:text-white outline-none focus:border-heatmap-red"
                    >
                      <option value="Graphic Design">Graphic Design</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Layout Design">Layout Design</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Short Description</label>
                  <textarea 
                    placeholder="Brief overview of the project..." 
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl dark:text-white outline-none focus:border-heatmap-red h-24 resize-none"
                  />
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Project Image</label>
                  <div className="flex flex-col gap-4">
                    {selectedFile ? (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden group">
                        <img 
                          src={URL.createObjectURL(selectedFile)} 
                          className="w-full h-full object-cover" 
                        />
                        <button 
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-heatmap-red hover:bg-white/5 transition-all">
                        <ImageIcon className="text-white/20 mb-2" size={32} />
                        <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Click to upload image</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Tools (Comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="Figma, Photoshop, React" 
                      onChange={e => setNewProject({...newProject, tools: e.target.value.split(',').map(t => t.trim())})}
                      className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl dark:text-white outline-none focus:border-heatmap-red"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Tags (Comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="Web, Mobile, Branding" 
                      onChange={e => setNewProject({...newProject, tags: e.target.value.split(',').map(t => t.trim())})}
                      className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl dark:text-white outline-none focus:border-heatmap-red"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Case Study Content (Markdown)</label>
                  <textarea 
                    placeholder="# Process..." 
                    value={newProject.case_study_content}
                    onChange={e => setNewProject({...newProject, case_study_content: e.target.value})}
                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl dark:text-white outline-none focus:border-heatmap-red h-40 resize-none font-mono text-sm"
                  />
                </div>

                <button className="w-full py-5 bg-gradient-heatmap text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-heatmap-red/20">
                  <Save size={20} /> Publish Project
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-zinc-900 p-10 rounded-[2.5rem] text-center border border-white/10"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Delete Project?</h3>
              <p className="text-white/50 mb-8">Are you sure you want to delete this project? This action cannot be undone.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- Sub-components ---

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => {
  const colorClasses = {
    blue: 'text-heatmap-blue bg-heatmap-blue/10',
    yellow: 'text-heatmap-yellow bg-heatmap-yellow/10',
    red: 'text-heatmap-red bg-heatmap-red/10',
    green: 'text-emerald-500 bg-emerald-500/10',
    gray: 'text-white/50 bg-white/5',
  }[color as keyof typeof colorClasses];

  return (
    <div className="glass-card p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colorClasses}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold dark:text-white">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">{label}</p>
    </div>
  );
};

const ProjectAdminCard = ({ project, onToggleStatus, onDelete }: { project: Project, onToggleStatus: (id: string, s: string) => void, onDelete: () => void, key?: any }) => {
  return (
    <motion.div 
      layout
      className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col group"
    >
      <div className="relative h-56 overflow-hidden">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
        <div className="absolute top-4 right-4">
          <StatusBadge status={project.status || 'Published'} />
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button 
            onClick={() => onToggleStatus(project.id, project.status || 'Published')}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
          >
            {project.status === 'Hidden' ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
          <button 
            onClick={onDelete}
            className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-heatmap-red uppercase tracking-widest">{project.category}</span>
            <h4 className="text-xl font-bold dark:text-white tracking-tight mt-1">{project.title}</h4>
          </div>
        </div>
        <p className="text-sm opacity-50 line-clamp-2 mb-6 dark:text-white/50">{project.description}</p>
        
        <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
          <div className="flex gap-2">
            {project.tools.slice(0, 2).map(tool => (
              <span key={tool} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md dark:text-white/40">
                {tool}
              </span>
            ))}
          </div>
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1">
            <Clock size={10} /> {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const isPublished = status === 'Published';
  return (
    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${
      isPublished 
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
        : 'bg-white/10 text-white/50 border-white/20'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
      {status}
    </div>
  );
};
