import { Project, Experience } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Lost in Labyrinth',
    category: 'Graphic Design',
    description: 'A conceptual logo and branding project exploring complex geometric patterns and mystery.',
    tools: ['Adobe Illustrator', 'Photoshop'],
    image: 'https://picsum.photos/seed/labyrinth/800/600',
    color: '#FF3300',
    caseStudy: {
      overview: 'Lost in Labyrinth is a branding project that focuses on the concept of navigation through complexity.',
      problem: 'Creating a visual identity that feels both mysterious and structured.',
      process: 'I started with hand-drawn sketches of mazes and refined them into geometric vectors.',
      outcome: 'A versatile logo system that works across various media.',
      screens: ['https://picsum.photos/seed/lab1/1200/800', 'https://picsum.photos/seed/lab2/1200/800']
    }
  },
  {
    id: '2',
    title: 'Broadway Menu',
    category: 'Layout Design',
    description: 'Elegant and high-contrast menu design for a theater-themed restaurant.',
    tools: ['Adobe InDesign', 'Illustrator'],
    image: 'https://picsum.photos/seed/broadway/800/600',
    color: '#FFDD00',
  },
  {
    id: '3',
    title: 'E-Commerce App',
    category: 'UI/UX Design',
    description: 'A modern shopping experience focused on accessibility and clean aesthetics.',
    tools: ['Figma', 'React'],
    image: 'https://picsum.photos/seed/ecommerce/800/600',
    color: '#0066FF',
  },
  {
    id: '4',
    title: 'Publication Materials',
    category: 'Graphic Design',
    description: 'A series of posters and flyers for university events and organizations.',
    tools: ['Photoshop', 'Canva'],
    image: 'https://picsum.photos/seed/pub/800/600',
    color: '#FF3300',
  },
  {
    id: '5',
    title: 'Healthcare Dashboard',
    category: 'UI/UX Design',
    description: 'Complex data visualization for medical professionals.',
    tools: ['Figma', 'D3.js'],
    image: 'https://picsum.photos/seed/health/800/600',
    color: '#0066FF',
  },
  {
    id: '6',
    title: 'Logo Collection 2024',
    category: 'Graphic Design',
    description: 'A showcase of various logo designs created throughout the year.',
    tools: ['Adobe Illustrator'],
    image: 'https://picsum.photos/seed/logos/800/600',
    color: '#FFDD00',
  }
];

export const EXPERIENCES: Experience[] = [
  {
    role: 'Graphic Design Lead',
    company: 'Google Developer Groups On Campus - UP Manila',
    period: '2024 - Present',
    description: 'Leading the design team for campus-wide tech events and workshops.'
  },
  {
    role: 'Vice President for Visuals',
    company: 'UP SoComSci',
    period: '2023 - Present',
    description: 'Managing the visual identity and social media presence of the organization.'
  },
  {
    role: 'Layout Head',
    company: 'The Manila Collegian',
    period: '2023 - Present',
    description: 'Overseeing the layout and design of the official student publication.'
  }
];

export const SKILLS = [
  { name: 'UI/UX Design', level: 90 },
  { name: 'Graphic Design', level: 95 },
  { name: 'Layout Design', level: 85 },
  { name: 'Frontend Development', level: 70 },
  { name: 'Branding', level: 80 }
];

export const TOOLS = [
  'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'React', 'Tailwind CSS', 'Canva'
];
