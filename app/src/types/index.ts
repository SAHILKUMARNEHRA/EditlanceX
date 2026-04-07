export interface User {
  id: string;
  name: string;
  email: string;
  role: 'editor' | 'client';
  avatar?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  videoType?: string;
  software?: string[];
  budget: number;
  deadline: string;
  clientId: string;
  clientName: string;
  status: 'open' | 'closed' | 'in-progress';
  createdAt: string;
  applied?: boolean;
  applicationsCount?: number;
  applications?: Application[];
}

export interface Application {
  id: string;
  appliedAt: string;
  editor: {
    id: string;
    name: string;
    email: string;
    profile: EditorProfile | null;
  };
}

export interface Editor {
  id: string;
  name: string;
  avatar?: string;
  skills: string[];
  experience: string;
  experienceDetails?: string;
  portfolio?: string[];
  availability: string;
  bio?: string;
}

export interface EditorProfile {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  skills: string[];
  experience: string;
  experienceDetails?: string;
  portfolioLinks: string[];
  availability: string;
  bio: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
