export type User = { id: number; name: string; email: string };

export type JobStatus = "nova" | "salva" | "candidatado" | "descartada";
export type Verdict = "excelente" | "boa" | "parcial" | "fraca";

export type JobListItem = {
  id: number;
  title: string;
  company: string;
  location: string;
  source: string;
  status: JobStatus;
  url?: string;
  created_at?: string;
  score: number | null;
  verdict: Verdict | null;
  summary: string | null;
};

export type Analysis = {
  score: number;
  verdict: Verdict;
  summary: string;
  strengths: string[];
  gaps: string[];
  red_flags: string[];
  application_tips: string;
  engine: string;
  analyzed_at: string;
};

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  source: string;
  status: JobStatus;
  posted_at: string | null;
  created_at: string;
  analysis: Analysis | null;
};

export type Profile = {
  headline: string;
  seniority: string;
  desired_roles: string;
  skills: string;
  experience: string;
  languages: string;
  locations: string;
  work_mode: string;
  salary_min: string;
  deal_breakers: string;
  resume_text: string;
  search_keywords: string;
  greenhouse_boards: string;
  lever_boards: string;
  min_score: number;
  auto_collect_hours: number;
  auto_analyze: boolean;
  last_auto_run: string | null;
};

export type Completion = { percent: number; missing: string[] };

export type MonthUsage = { analyses: number; costUsd: number; maxAnalyses: number; budgetUsd: number };

export type Dashboard = {
  stats: { total: number; analyzed: number; good: number; saved: number; applied: number };
  pending: number;
  minScore: number;
  topJobs: JobListItem[];
  completion: Completion;
  sourcesConfigured: number;
  automation: { collectHours: number; autoAnalyze: boolean; lastRun: string | null; nextRun: string | null };
  ai: { enabled: boolean; model: string; prefilterMinScore: number; usage: MonthUsage };
};

export type Notification = { id: number; job_id: number | null; message: string; read: number; created_at: string };

export type JobFilter = "melhores" | "todas" | "pendentes" | "salva" | "candidatado" | "descartada";
