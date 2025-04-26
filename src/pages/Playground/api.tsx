import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

// Configure axios with authentication
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch all projects
export const fetchProjects = () => apiClient.get('projects/');

// Fetch a specific project by ID
export const fetchProject = (id) => apiClient.get(`projects/${id}/`);

// Fetch project files by project ID
export const fetchProjectFiles = (projectId) => apiClient.get(`project_files/by_project/?project=${projectId}`);

// Update a specific file by file ID
export const updateFile = (fileId, content) => apiClient.patch(`project_files/${fileId}/`, { content });

// Create a new project (using POST)
export const createProject = (projectData) => apiClient.post('projects/create/', projectData);

