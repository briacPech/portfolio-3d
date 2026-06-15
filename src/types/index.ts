// Types stricts pour le portfolio
export interface Profile {
  id: number;
  full_name: string;
  email: string;
  linkedin_url?: string;
  github_url?: string;
  targetRole: string;
  sector: string;
  absolutelyAvoid: string;
  cvText: string;
  bio?: string;
  short_description?: string;
}

export interface IslandData {
  id: string;
  title: string;
  presentation?: string;
}

export interface Skill {
  id: number;
  category: string;
  name: string;
  level?: number;
  display_order: number;
}

export interface Experience {
  id: number;
  company: string;
  job_title: string;
  start_date: string;
  end_date: string;
  description: string;
  display_order: number;
}

export interface Project {
  id: number;
  title: string;
  short_description: string;
  long_description: string;
  image_url?: string;
  link_url?: string;
  secondary_link_url?: string;
  secondary_link_text?: string;
  tags: string[];
  status: string;
  display_order: number;
}

export interface SeoSettings {
  id: number;
  title: string;
  description: string;
  keywords?: string;
  og_image?: string;
  twitter_card?: string;
  og_image_url?: string;
}
