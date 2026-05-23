import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import type { Project } from "../types";
import { projectsService } from "../services/projectsService";

interface ProjectsContextValue {
  projects:     Project[];
  addProject:   (name: string, description?: string) => Project;
  renameProject:(id: string, name: string) => void;
  archiveProject:(id: string) => void;
  restoreProject:(id: string) => void;
  deleteProject: (id: string) => void;
  getProjectById:(id: string) => Project | null;
}

const ProjectsContext = createContext<ProjectsContextValue>({
  projects:      [],
  addProject:    () => ({ id: "", userId: "", name: "", description: null, status: "active", createdAt: "", updatedAt: "" }),
  renameProject: () => {},
  archiveProject:() => {},
  restoreProject:() => {},
  deleteProject: () => {},
  getProjectById:() => null,
});

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "local";

  const [projects, setProjects] = useState<Project[]>(() =>
    projectsService.getAll()
  );

  const refresh = useCallback(() => {
    setProjects(projectsService.getAll());
  }, []);

  const addProject = useCallback((name: string, description?: string): Project => {
    const project = projectsService.create(userId, name, description);
    refresh();
    return project;
  }, [userId, refresh]);

  const renameProject = useCallback((id: string, name: string) => {
    projectsService.rename(id, name);
    refresh();
  }, [refresh]);

  const archiveProject = useCallback((id: string) => {
    projectsService.archive(id);
    refresh();
  }, [refresh]);

  const restoreProject = useCallback((id: string) => {
    projectsService.restore(id);
    refresh();
  }, [refresh]);

  const deleteProject = useCallback((id: string) => {
    projectsService.delete(id);
    refresh();
  }, [refresh]);

  const getProjectById = useCallback((id: string): Project | null => {
    return projects.find((p) => p.id === id) ?? null;
  }, [projects]);

  return (
    <ProjectsContext.Provider value={{
      projects,
      addProject,
      renameProject,
      archiveProject,
      restoreProject,
      deleteProject,
      getProjectById,
    }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  return useContext(ProjectsContext);
}
