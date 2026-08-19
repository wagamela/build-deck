import { useEffect, useState } from "react";
import { fallbackProjects, type Project } from "../data/projects";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export interface UseProjectsResult {
  projects: Project[] | null;
  error: string | null;
  usingFallback: boolean;
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`${API_BASE}/projects`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }
        const data = (await response.json()) as Project[];
        setProjects(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Could not load projects",
        );
        setProjects(fallbackProjects);
        setUsingFallback(true);
      }
    }

    load();

    return () => controller.abort();
  }, []);

  return { projects, error, usingFallback };
}