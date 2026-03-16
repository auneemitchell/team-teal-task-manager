import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard.jsx";

/**
 * Projects Page
 *
 * Displays a list of all projects as a grid of cards.
 * Each card links to the project's board view at /projects/:id.
 */
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json().catch(() => null);
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.error("API error loading projects", data);
        setProjects([]);
      }
    } catch (err) {
      console.error("Fetch error", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg px-6 py-4 shadow-lg mb-6">
        <h1 className="text-3xl font-bold text-white m-0">Projects</h1>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="no-underline"
            >
              <ProjectCard
                project={project}
                isSelected={false}
                onClick={() => {}}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
