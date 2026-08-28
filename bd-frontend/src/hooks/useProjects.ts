import { useCallback, useEffect, useRef, useState } from "react";
import { fallbackProjects, type Project } from "../data/projects";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export interface UseProjectsResult {
  projects: Project[];
  error: string | null;
  usingFallback: boolean;
  loadMore: () => Promise<void>;
}

function projectKey(project: Project) {
  return `${project.owner}/${project.name}`.toLowerCase();
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const seenRef = useRef(new Set(fallbackProjects.map(projectKey)));

  const mergeUnique = useCallback((incoming: Project[]): Project[] => {
    return incoming.filter((project) => {
      const key = projectKey(project);
      if (seenRef.current.has(key)) return false;
      seenRef.current.add(key);
      return true;
    });
  }, []);

  const fetchBatch = useCallback(
    async (signal?: AbortSignal): Promise<Project[]> => {
      const response = await fetch(`${API_BASE}/projects`, { signal });
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }
      return (await response.json()) as Project[];
    },
    [],
  );

  const loadMore = useCallback(async () => {
    try {
      const batch = await fetchBatch();
      const fresh = mergeUnique(batch);
      if (fresh.length > 0) {
        setProjects((current) => [...current, ...fresh]);
      }
    } catch {
      // Background refills are best-effort; keep whatever we already have.
    }
  }, [fetchBatch, mergeUnique]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitial() {
      try {
        const batch = await fetchBatch(controller.signal);
        setProjects(batch);
        seenRef.current = new Set(batch.map(projectKey));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Could not load projects",
        );
        setUsingFallback(true);
      }
    }

    loadInitial();

    return () => controller.abort();
  }, [fetchBatch, mergeUnique]);

  return { projects, error, usingFallback, loadMore };
}