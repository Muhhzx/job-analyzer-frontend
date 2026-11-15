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
  /** Nota grátis por palavras-chave (sempre existe). */
  preview_score: number | null;
  /** Nota da IA (só se o usuário pediu a análise). */
  score: number | null;
  verdict: Verdict | null;
  summary: string | null;
};

/** O que a prévia grátis encontrou na vaga. */
export type Preview = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  roleMatched: string | null;
  dealBreakers: string[];
  seniority: {
    job: string | null;
    profile: string | null;
    gap: number | null;
    penalty: number;
    source: "título" | "experiência pedida" | null;
    evidence: string | null;
    accepted: boolean | null;
  };
  belowCutoff: boolean;
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
  /** Faixa salarial da vaga. null em análises feitas antes desse campo existir. */
  salary_estimate: SalaryEstimate | null;
};

export type SalaryEstimate = {
  source: "informado na vaga" | "estimativa";
  min: number;
  max: number;
  currency: "BRL" | "USD" | "EUR";
  period: "mensal" | "anual" | "por hora";
  contract: "CLT" | "PJ" | "não informado";
  basis: string;
  vs_candidate: "acima da pretensão" | "dentro da pretensão" | "abaixo da pretensão" | "pretensão não informada";
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
  preview: Preview | null;
  analysis: Analysis | null;
  /** Candidatura no quadro (null se a vaga nunca foi salva ou candidatada). */
  application: Application | null;
  applicationEvents: ApplicationEvent[];
  aiEnabled: boolean;
  prefilterMinScore: number;
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
  /** Níveis de vaga que quero ver, ex.: "1,2". Vazio = automático (meu nível e um acima). */
  accepted_levels: string;
  min_score: number;
  auto_collect_hours: number;
  auto_analyze: boolean;
  last_auto_run: string | null;
};

export type Completion = { percent: number; missing: string[] };

export type MonthUsage = { analyses: number; costUsd: number; maxAnalyses: number; budgetUsd: number };

export type Dashboard = {
  stats: { total: number; analyzed: number; good: number; saved: number; applied: number };
  minScore: number;
  topJobs: JobListItem[];
  completion: Completion;
  sourcesConfigured: number;
  automation: { collectHours: number; autoAnalyze: boolean; lastRun: string | null; nextRun: string | null };
  ai: { enabled: boolean; model: string; prefilterMinScore: number; usage: MonthUsage };
};

export type Notification = { id: number; job_id: number | null; message: string; read: number; created_at: string };

export type JobFilter = "melhores" | "todas" | "nova" | "salva" | "candidatado" | "descartada" | "ia";

/** Resposta da listagem de vagas (paginada). */
export type JobListResponse = {
  jobs: JobListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: Record<JobFilter, number>;
  companies: { name: string; count: number }[];
  minScore: number;
  minVisibleScore: number;
  prefilterMinScore: number;
};

/** Etapas do quadro de candidaturas, na ordem das colunas. */
export type Stage = "salva" | "candidatei" | "teste" | "entrevista" | "proposta" | "encerrada";

/** Dados da candidatura de uma vaga (o que você anota enquanto acompanha o processo). */
export type Application = {
  job_id: number;
  stage: Stage;
  /** Data da candidatura (AAAA-MM-DD). */
  applied_at: string | null;
  resume_used: string;
  salary_expectation: string;
  contact: string;
  notes: string;
  stage_changed_at: string;
  updated_at: string;
};

export type ApplicationEvent = { stage: Stage; created_at: string };

/** Cartão do quadro: candidatura + o essencial da vaga. */
export type BoardItem = Application & {
  title: string;
  company: string;
  location: string;
  url: string;
  score: number | null;
  analyzed: boolean;
};

export type BoardResponse = { stages: Stage[]; items: BoardItem[]; resumes: string[] };
