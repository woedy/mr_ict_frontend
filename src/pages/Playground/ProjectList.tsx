
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects } from './api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchProjects();
        setProjects(response.data);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  if (loading) {
    return <div className="p-4">Loading projects...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Projects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <div key={project.id} className="border rounded p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{project.title}</h2>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date(project.updated_at).toLocaleDateString()}
            </p>
            <Link
              to={`/code-editor`}
              className="block mt-2 text-center bg-blue-500 text-black py-2 rounded hover:bg-blue-600"
            >
              Open Editor
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;