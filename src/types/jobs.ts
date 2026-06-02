export type ExperienceLevel = "Fresher" | "Experienced" | "Any";
export type WorkMode = "On-site" | "Remote" | "Hybrid";
export type ContractType = "Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship";

export interface VaartanowJob {
  job_id: string;
  title: string;
  company_name: string;
  location: string;
  district?: string;
  state?: string;
  description_snippet: string;
  full_description: string;
  apply_link: string;
  source_platform: string;
  posted_date: string;
  salary_range?: string;
  skills: string[];
  tags: string[];
  logo_url?: string;
  experience_level: ExperienceLevel;
  work_mode: WorkMode;
  contract_type: ContractType;
  is_featured: boolean;
  is_approved: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface JobFilters {
  query: string;
  workMode?: WorkMode | "all";
  experienceLevel?: ExperienceLevel | "all";
  contractType?: ContractType | "all";
  district?: string;
  state?: string;
  skills?: string[];
  source?: string | "all";
}

export interface AIResumeAnalysis {
  atsScore: number;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  feedback: string;
  summary: string;
  careerPathAdvice: string;
}
