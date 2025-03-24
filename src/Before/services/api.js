import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = {
  // Recording endpoints
  createRecording: async (data) => {
    const response = await axios.post(`${API_URL}/recordings/`, data);
    return response.data;
  },
  
  updateRecording: async (id, data) => {
    const response = await axios.patch(`${API_URL}/recordings/${id}/`, data);
    return response.data;
  },
  
  getRecordings: async () => {
    const response = await axios.get(`${API_URL}/recordings/`);
    return response.data;
  },
  
  // Code snapshot endpoints
  createCodeSnapshot: async (data) => {
    const response = await axios.post(`${API_URL}/code-snapshots/`, data);
    return response.data;
  },
  
  createCodeSnapshotBatch: async (snapshots) => {
    const response = await axios.post(`${API_URL}/code-snapshots/create_batch/`, snapshots);
    return response.data;
  },
  
  getCodeSnapshots: async (recordingId) => {
    const response = await axios.get(`${API_URL}/code-snapshots/?recording_id=${recordingId}`);
    return response.data;
  }
};

export default api;