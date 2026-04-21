// Get the API URL and normalize it (remove trailing slash if present)
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Helper function for API calls
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  // Normalize endpoint (ensure it starts with /)
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${path}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Not JSON (e.g., HTML error page from the hosting provider)
      const text = await response.text();
      console.error('Non-JSON response from API:', text);
      throw new Error(`Server returned a non-JSON response (${response.status}). The backend URL might be wrong or the server might be down.`);
    }
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `Server error: ${response.status}`);
    }
    
    return data;
  } catch (error: any) {
    console.error(`API Call failed: ${url}`, error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Could not connect to the backend server. Please check your VITE_API_URL and ensure the backend is running and supports HTTPS.');
    }
    throw error;
  }
}

// Auth APIs
export const login = async (email: string, password: string, role: string) => {
  return fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
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
export const getMe = async () => {
  return fetchWithAuth('/users/me');
};

export const getAdminStats = async () => {
  return fetchWithAuth('/admin/stats');
};

export const getAdminUsers = async () => {
  return fetchWithAuth('/admin/users');
};

export const deleteUser = async (id: string) => {
  return fetchWithAuth(`/admin/users/${id}`, { method: 'DELETE' });
};

export const resetUserPassword = async (id: string, newPassword: string) => {
  return fetchWithAuth(`/admin/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  });
};

export const getAdminJobs = async () => {
  return fetchWithAuth('/admin/jobs');
};

export const deleteJob = async (id: string) => {
  return fetchWithAuth(`/admin/jobs/${id}`, { method: 'DELETE' });
};

// Requests APIs
export const sendDirectRequest = async (editorId: string) => {
  return fetchWithAuth('/requests/direct', {
    method: 'POST',
    body: JSON.stringify({ editorId })
  });
};

export const getClientRequests = async () => {
  return fetchWithAuth('/requests/client');
};

export const getEditorRequests = async () => {
  return fetchWithAuth('/requests/editor');
};

export const respondToRequest = async (id: string, status: 'HIRED' | 'NOT_HIRED') => {
  return fetchWithAuth(`/requests/direct/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
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
  getMe,
  getAdminStats,
  getAdminUsers,
};
