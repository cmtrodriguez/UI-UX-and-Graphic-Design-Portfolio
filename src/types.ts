export interface Project {
  id: string;
  title: string;
  category: 'Graphic Design' | 'UI/UX Design' | 'Layout Design';
  description: string;
  tools: string[];
  tags?: string[];
  image: string;
  color: string;
  status?: 'Published' | 'Hidden';
  case_study_content?: string;
  created_at?: string;
  caseStudy?: {
    overview: string;
    problem: string;
    process: string;
    outcome: string;
    screens: string[];
  };
}

export interface Skill {
  name: string;
  level: number;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}
