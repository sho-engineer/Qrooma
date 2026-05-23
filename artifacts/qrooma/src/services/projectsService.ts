/**
 * ─── Projects Service ─────────────────────────────────────────────────────────
 *
 * localStorage-backed CRUD for Project entities.
 * Production replacement: Supabase `projects` table.
 */

import type { Project } from "../types";

const STORAGE_KEY = "qrooma_projects_v1";

function load(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Project[];
  } catch { /* ignore */ }
  return [];
}

function save(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function now(): string {
  return new Date().toISOString();
}

export const projectsService = {
  getAll(): Project[] {
    return load();
  },

  getById(id: string): Project | null {
    return load().find((p) => p.id === id) ?? null;
  },

  getActive(): Project[] {
    return load().filter((p) => p.status === "active");
  },

  create(userId: string, name: string, description?: string): Project {
    const project: Project = {
      id:          crypto.randomUUID(),
      userId,
      name:        name.trim(),
      description: description?.trim() ?? null,
      status:      "active",
      createdAt:   now(),
      updatedAt:   now(),
    };
    const projects = load();
    projects.unshift(project);
    save(projects);
    return project;
  },

  rename(id: string, name: string): Project | null {
    const projects = load();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    projects[idx] = { ...projects[idx], name: name.trim(), updatedAt: now() };
    save(projects);
    return projects[idx];
  },

  archive(id: string): void {
    const projects = load();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return;
    projects[idx] = { ...projects[idx], status: "archived", updatedAt: now() };
    save(projects);
  },

  restore(id: string): void {
    const projects = load();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return;
    projects[idx] = { ...projects[idx], status: "active", updatedAt: now() };
    save(projects);
  },

  delete(id: string): void {
    const projects = load().filter((p) => p.id !== id);
    save(projects);
  },
};
