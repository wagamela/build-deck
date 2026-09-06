import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "../data/projects";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export interface UseProjectsResult {
  projects: Project[];
  error: string | null;
  loading: boolean;
  loadMore: () => Promise<void>;
}

function projectKey(project: Project) {
  return `${project.owner}/${project.name}`.toLowerCase();
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const seenRef = useRef(new Set<string>());

  const mergeUnique = useCallback((incoming: Project[]): Project[] => {
    return incoming.filter((project) => {
      const key = projectKey(project);
      if (seenRef.current.has(key)) return false;
      seenRef.current.add(key);
      return true;
    });
  }, []);

  const fetchBatch = useCallback(
    async ({ perPage, signal, light }: { perPage?: number; signal?: AbortSignal; light?: boolean } = {}): Promise<Project[]> => {
      const params = new URLSearchParams();
      if (perPage) params.set("per_page", String(perPage));
      if (light) params.set("light", "1");
      const qs = params.toString();
      const url = qs ? `${API_BASE}/projects?${qs}` : `${API_BASE}/projects`;
      const response = await fetch(url, { signal });
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
      // Background refills are best-effort
    }
  }, [fetchBatch, mergeUnique]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitial() {
      try {
        setLoading(true);

        const firstBatch = await fetchBatch({ perPage: 1, signal: controller.signal });
        const uniqueFirst = mergeUnique(firstBatch);
        if (uniqueFirst.length > 0) {
          setProjects(uniqueFirst);
        }
        setLoading(false);

        const restBatch = await fetchBatch({ perPage: 11, signal: controller.signal });
        const uniqueRest = mergeUnique(restBatch);
        if (uniqueRest.length > 0) {
          setProjects((current) => [...current, ...uniqueRest]);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Could not load projects",
        );
        setLoading(false);
      }
    }

    loadInitial();

    return () => controller.abort();
  }, [fetchBatch, mergeUnique]);

  return { projects, error, loading, loadMore };
}
