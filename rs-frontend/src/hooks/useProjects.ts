import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "../data/projects";
import {
  createTasteProfile,
  pickSteerTopic,
  recordSwipe,
  rerankProjects,
  topTopics,
  type Direction,
  type TasteTopic,
} from "../lib/taste";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

/**
 * Cards this far ahead of the one just swiped keep their position. They are
 * already preloaded and partly on screen, so reordering them would swap an
 * image out from under the user.
 */
const RERANK_LOOKAHEAD = 2;
/** Below this, a steered batch is topped up with an unsteered one. */
const MIN_FRESH_PER_REFILL = 4;

export interface UseProjectsResult {
  projects: Project[];
  error: string | null;
  loading: boolean;
  loadMore: () => Promise<void>;
  /** Feeds a swipe into the taste model and reorders the cards still ahead. */
  recordDecision: (
    index: number,
    project: Project,
    direction: Direction,
  ) => void;
  /** Strongest affinities so far; surfaced in the debug panel. */
  tasteTopics: TasteTopic[];
}

function projectKey(project: Project) {
  return `${project.owner}/${project.name}`.toLowerCase();
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasteTopics, setTasteTopics] = useState<TasteTopic[]>([]);
  const seenRef = useRef(new Set<string>());
  const tasteRef = useRef(createTasteProfile());
  const frozenUntilRef = useRef(0);
  const batchRef = useRef(1);

  const mergeUnique = useCallback((incoming: Project[]): Project[] => {
    return incoming.filter((project) => {
      const key = projectKey(project);
      if (seenRef.current.has(key)) return false;
      seenRef.current.add(key);
      return true;
    });
  }, []);

  const fetchBatch = useCallback(
    async ({
      perPage,
      signal,
      light,
      topic,
      batch,
    }: {
      perPage?: number;
      signal?: AbortSignal;
      light?: boolean;
      topic?: string | null;
      batch?: number;
    } = {}): Promise<Project[]> => {
      const params = new URLSearchParams();
      if (perPage) params.set("per_page", String(perPage));
      if (light) params.set("light", "1");
      if (topic) params.set("topic", topic);
      // Always pass batch if specified, even if it's 1, to ensure consistent
      // cache keys and randomization on page reload.
      if (batch && batch > 0) params.set("batch", String(batch));
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

  const appendFresh = useCallback((fresh: Project[]) => {
    if (fresh.length === 0) return;
    setProjects((current) =>
      rerankProjects(
        [...current, ...fresh],
        frozenUntilRef.current,
        tasteRef.current,
      ),
    );
  }, []);

  const loadMore = useCallback(async () => {
    try {
      const batch = batchRef.current++;
      const topic = pickSteerTopic(tasteRef.current);
      const fresh = mergeUnique(await fetchBatch({ topic, batch }));

      // A niche topic can come back thin once deduped against what the deck
      // already holds; fall back to the general feed so the stack never runs dry.
      if (topic && fresh.length < MIN_FRESH_PER_REFILL) {
        const filler = mergeUnique(
          await fetchBatch({ batch: batchRef.current++ }),
        );
        appendFresh([...fresh, ...filler]);
        return;
      }

      appendFresh(fresh);
    } catch {
      // Background refills are best-effort
    }
  }, [appendFresh, fetchBatch, mergeUnique]);

  const recordDecision = useCallback(
    (index: number, project: Project, direction: Direction) => {
      recordSwipe(tasteRef.current, project, direction);
      frozenUntilRef.current = Math.max(
        frozenUntilRef.current,
        index + RERANK_LOOKAHEAD,
      );
      setTasteTopics(topTopics(tasteRef.current, 5));
      setProjects((current) =>
        rerankProjects(current, frozenUntilRef.current, tasteRef.current),
      );
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitial() {
      try {
        setLoading(true);

        // Randomize starting batch to avoid always showing the same repos on reload.
        // GitHub search results are deterministic for a given page, so varying the
        // batch ensures variety even when server cache expires.
        const randomInitialBatch = Math.floor(Math.random() * 100) + 1;

        const firstBatch = await fetchBatch({
          perPage: 1,
          signal: controller.signal,
          batch: randomInitialBatch,
        });
        const uniqueFirst = mergeUnique(firstBatch);
        if (uniqueFirst.length > 0) {
          setProjects(uniqueFirst);
        }
        setLoading(false);

        const restBatch = await fetchBatch({
          perPage: 11,
          signal: controller.signal,
          batch: randomInitialBatch,
        });
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

  return { projects, error, loading, loadMore, recordDecision, tasteTopics };
}
