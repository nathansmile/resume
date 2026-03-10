export interface Candidate {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  status: CandidateStatus;
  pdfUrl: string;
  pdfThumbnail?: string;
  rawText: string;
  createdAt: string;
  updatedAt: string;
  educations?: Education[];
  workExperiences?: WorkExperience[];
  skills?: Skill[];
  projects?: Project[];
  evaluations?: Evaluation[];
}

export interface Education {
  id: string;
  school: string;
  major?: string;
  degree?: string;
  graduationDate?: string;
  orderIndex: number;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  orderIndex: number;
}

export interface Skill {
  id: string;
  skillName: string;
  category?: string;
}

export interface Project {
  id: string;
  projectName: string;
  techStack: string[];
  role?: string;
  highlights?: string;
  orderIndex: number;
}

export interface JobDescription {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  id: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  skillMatchScore: number;
  experienceScore: number;
  educationScore: number;
  aiComment: string;
  createdAt: string;
  candidate?: Partial<Candidate>;
  jobDescription?: Partial<JobDescription>;
}

export enum CandidateStatus {
  PENDING = 'PENDING',
  INITIAL_PASS = 'INITIAL_PASS',
  INTERVIEWING = 'INTERVIEWING',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

export interface UploadResult {
  success: boolean;
  data?: {
    id: string;
    name: string;
    rawText: string;
    createdAt: string;
  };
  error?: string;
  filename: string;
}
