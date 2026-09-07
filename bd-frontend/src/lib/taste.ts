import type { Project } from "../data/projects";

/**
 * Taste model behind the deck's recommendations.
 *
 * Every swipe is turned into a bag of weighted features (topics, languages,
 * owner, description words). Likes push those feature weights up, passes push
 * them down, and older swipes decay so the deck follows where the session is
 * heading rather than where it started. Unseen cards are then scored against
 * the profile and reordered, and refills are steered toward a topic the
 * profile likes.
 */

export type Direction = "left" | "right";

export interface TasteProfile {
  /** feature -> weight, bounded to [-MAX_WEIGHT, MAX_WEIGHT]. */
  weights: Map<string, number>;
  swipes: number;
}

export interface TasteTopic {
  topic: string;
  weight: number;
}

const TOPIC_KIND = 1;
const LANGUAGE_KIND = 0.6;
const OWNER_KIND = 0.35;
const WORD_KIND = 0.3;

const LIKE_DELTA = 1;
const PASS_DELTA = -0.55;
/** Each swipe fades what came before it, so recent taste dominates. */
const DECAY = 0.94;
const MAX_WEIGHT = 6;
/** Below this the profile is treated as empty and nothing is reordered. */
const SIGNAL_THRESHOLD = 0.4;

/** Blind reordering makes a filter bubble; this keeps unrelated cards in play. */
const EXPLORATION = 0.35;
/** How many just-placed cards a candidate is checked against for sameness. */
const DIVERSITY_WINDOW = 3;
const DIVERSITY_PENALTY = 0.22;

const STOP_WORDS = new Set([
  "a", "an", "and", "for", "the", "with", "your", "you", "that", "this", "from",
  "into", "its", "it", "of", "on", "in", "to", "is", "are", "be", "by", "as",
  "at", "or", "not", "all", "any", "can", "how", "via", "use", "used", "using",
  "make", "makes", "made", "new", "more", "most", "very", "just", "simple",
  "easy", "fast", "small", "free", "open", "source", "based", "built", "build",
  "project", "projects", "tool", "tools", "library", "libraries", "framework",
  "app", "apps", "code", "codes", "support", "supports", "written", "modern",
  "lightweight", "cross", "platform", "official", "awesome", "list", "curated",
  "collection", "repo", "repository", "github", "https", "http", "www", "com",
]);

export function createTasteProfile(): TasteProfile {
  return { weights: new Map(), swipes: 0 };
}

function normalizeTopic(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function projectTopics(project: Project): string[] {
  const topics = (project.topics ?? []).map(normalizeTopic).filter(Boolean);
  if (topics.length > 0) return topics.slice(0, 8);
  // Older payloads (and the bundled fallbacks) only carry the derived category.
  const fromCategory = normalizeTopic(project.category ?? "");
  return fromCategory ? [fromCategory] : [];
}

function descriptionWords(project: Project): string[] {
  const text = `${project.name} ${project.description ?? ""}`.toLowerCase();
  const words = text.match(/[a-z][a-z0-9+.]{2,}/g) ?? [];
  const unique = new Set<string>();
  for (const word of words) {
    const clean = word.replace(/\.+$/, "");
    if (clean.length < 3 || STOP_WORDS.has(clean)) continue;
    unique.add(clean);
    if (unique.size >= 12) break;
  }
  return [...unique];
}

/**
 * Feature vector for a project. Values are how much the feature says about the
 * project — a language that is 80% of the repo counts for more than a 5% one.
 */
export function projectFeatures(project: Project): Map<string, number> {
  const features = new Map<string, number>();

  for (const topic of projectTopics(project)) {
    features.set(`topic:${topic}`, TOPIC_KIND);
  }

  for (const language of project.languages ?? []) {
    const key = `lang:${language.name.toLowerCase()}`;
    const share = Math.max(language.share, 0) / 100;
    features.set(key, LANGUAGE_KIND * (0.4 + 0.6 * share));
  }

  if (project.owner) {
    features.set(`owner:${project.owner.toLowerCase()}`, OWNER_KIND);
  }

  for (const word of descriptionWords(project)) {
    if (features.has(`topic:${word}`)) continue;
    features.set(`word:${word}`, WORD_KIND);
  }

  return features;
}

export function recordSwipe(
  profile: TasteProfile,
  project: Project,
  direction: Direction,
): void {
  const delta = direction === "right" ? LIKE_DELTA : PASS_DELTA;
  const features = projectFeatures(project);

  for (const [feature, weight] of profile.weights) {
    const decayed = weight * DECAY;
    if (Math.abs(decayed) < 0.01) profile.weights.delete(feature);
    else profile.weights.set(feature, decayed);
  }

  for (const [feature, strength] of features) {
    const next = (profile.weights.get(feature) ?? 0) + delta * strength;
    profile.weights.set(
      feature,
      Math.max(-MAX_WEIGHT, Math.min(MAX_WEIGHT, next)),
    );
  }

  profile.swipes += 1;
}

function signalStrength(profile: TasteProfile): number {
  let total = 0;
  for (const weight of profile.weights.values()) total += Math.abs(weight);
  return total;
}

export function hasSignal(profile: TasteProfile): boolean {
  return profile.swipes > 0 && signalStrength(profile) >= SIGNAL_THRESHOLD;
}

/**
 * Affinity of a project for the current profile, squashed into (-1, 1).
 * Divided by the feature count so a repo with a long topic list cannot
 * out-score a focused one just by matching many things weakly.
 */
export function scoreProject(profile: TasteProfile, project: Project): number {
  const features = projectFeatures(project);
  if (features.size === 0) return 0;

  let dot = 0;
  for (const [feature, strength] of features) {
    dot += (profile.weights.get(feature) ?? 0) * strength;
  }

  return Math.tanh(dot / Math.sqrt(features.size) / 2);
}

/** Stable per-project jitter, so reranking does not reshuffle on every swipe. */
function stableNoise(project: Project): number {
  const key = `${project.owner}/${project.name}`.toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

function overlaps(a: Set<string>, b: Set<string>): boolean {
  for (const topic of a) if (b.has(topic)) return true;
  return false;
}

/**
 * Reorders the not-yet-seen tail of the deck by affinity.
 *
 * `frozenUntil` protects the cards the user is already looking at (and whose
 * images have been preloaded) — only cards from that index on are moved.
 */
export function rerankProjects(
  projects: Project[],
  frozenUntil: number,
  profile: TasteProfile,
): Project[] {
  const start = Math.min(Math.max(frozenUntil, 0), projects.length);
  if (projects.length - start < 2 || !hasSignal(profile)) return projects;

  const pool = projects.slice(start).map((project) => ({
    project,
    topics: new Set(projectTopics(project)),
    value: scoreProject(profile, project) + EXPLORATION * stableNoise(project),
  }));

  const ordered: Project[] = [];
  const recent: Set<string>[] = [];

  while (pool.length > 0) {
    let bestIndex = 0;
    let bestValue = -Infinity;

    for (let i = 0; i < pool.length; i += 1) {
      const candidate = pool[i];
      let penalty = 0;
      for (const seen of recent) {
        if (overlaps(candidate.topics, seen)) penalty += DIVERSITY_PENALTY;
      }
      const value = candidate.value - penalty;
      if (value > bestValue) {
        bestValue = value;
        bestIndex = i;
      }
    }

    const [picked] = pool.splice(bestIndex, 1);
    ordered.push(picked.project);
    recent.push(picked.topics);
    if (recent.length > DIVERSITY_WINDOW) recent.shift();
  }

  return [...projects.slice(0, start), ...ordered];
}

export function topTopics(profile: TasteProfile, limit = 5): TasteTopic[] {
  return [...profile.weights]
    .filter(([feature, weight]) => feature.startsWith("topic:") && weight > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([feature, weight]) => ({
      topic: feature.slice("topic:".length),
      weight,
    }));
}

/**
 * Picks the topic to steer the next GitHub query with. Sampled rather than
 * always taking the strongest one, so a session that likes several things
 * keeps seeing all of them; skipped entirely while the signal is still weak.
 */
export function pickSteerTopic(profile: TasteProfile): string | null {
  if (!hasSignal(profile)) return null;

  const candidates = topTopics(profile, 6).filter(
    ({ topic, weight }) =>
      weight >= 0.6 && /^[a-z0-9][a-z0-9-]{1,34}$/.test(topic),
  );
  if (candidates.length === 0) return null;

  const total = candidates.reduce((sum, { weight }) => sum + weight, 0);
  let ticket = Math.random() * total;
  for (const candidate of candidates) {
    ticket -= candidate.weight;
    if (ticket <= 0) return candidate.topic;
  }
  return candidates[0].topic;
}
