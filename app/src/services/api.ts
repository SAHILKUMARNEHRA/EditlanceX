const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

// Auth APIs
export const login = async (email: string, password: string) => {
  return fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const signup = async (name: string, email: string, password: string, role: string, phone: string) => {
  return fetchWithAuth('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role, phone }),
  });
};

export const googleLogin = async (token: string, role?: string) => {
  return fetchWithAuth('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token, role }),
  });
};

// Job APIs
export const getJobs = async () => {
  return fetchWithAuth('/jobs');
};

export const getJobById = async (id: string) => {
  return fetchWithAuth(`/jobs/${id}`);
};

export const createJob = async (jobData: {
  title: string;
  description: string;
  category: string;
  videoType?: string;
  software?: string[];
  budget: number;
  deadline: string;
}) => {
  return fetchWithAuth('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  });
};

export const applyJob = async (jobId: string) => {
  return fetchWithAuth(`/jobs/${jobId}/apply`, {
    method: 'POST',
  });
};

export const getAppliedJobs = async () => {
  return fetchWithAuth('/jobs/applied');
};

export const getPostedJobs = async () => {
  return fetchWithAuth('/jobs/posted');
};

// Application APIs
export const updateApplicationStatus = async (id: string, status: 'HIRED' | 'NOT_HIRED') => {
  return fetchWithAuth(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const markAsContacted = async (id: string) => {
  return fetchWithAuth(`/applications/${id}/contact`, {
    method: 'PATCH',
  });
};

// Editor APIs
export const getEditors = async () => {
  return fetchWithAuth('/editors');
};

export const getEditorProfile = async () => {
  return fetchWithAuth('/editors/profile');
};

export const updateEditorProfile = async (profileData: {
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  skills: string[];
  experience: string;
  portfolioLinks: string[];
  availability: string;
}) => {
  return fetchWithAuth('/editors/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

// User APIs
export const getCurrentUser = async () => {
  return fetchWithAuth('/users/me');
};

export default {
  login,
  signup,
  googleLogin,
  getJobs,
  getJobById,
  createJob,
  applyJob,
  getAppliedJobs,
  getPostedJobs,
  getEditors,
  getEditorProfile,
  updateEditorProfile,
  getCurrentUser,
};
