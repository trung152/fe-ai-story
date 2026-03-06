const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export interface Story {
  id: string;
  title: string;
  genre: string;
  totalTurns: number;
  createdAt: string;
  synopsis?: string;
}

export interface Direction {
  id: number;
  label: string;
  text: string;
}

export interface Chapter {
  turn: number;
  title: string;
  content: string;
}

export interface ReadStoryResponse {
  story: Pick<Story, 'id' | 'title' | 'genre' | 'totalTurns'>;
  chapters: Chapter[];
  nextCursor: number | null;
  hasMore: boolean;
  lastDirections: Direction[];
}

export interface ContinueResponse {
  storyId: string;
  turnNumber: number;
  userInput: string;
  aiOutput: string;
  nextDirections: Direction[];
}

// ─── API Functions ──────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API Error');
  return json.data as T;
}

export async function listStories(): Promise<Story[]> {
  return apiFetch('/api/stories');
}

export interface CreateStoryResponse {
  story: Story & { synopsis: string };
  nextDirections: Direction[];
}

export async function createStory(title: string, genre: string, initialPrompt: string) {
  return apiFetch<CreateStoryResponse>('/api/stories', {
    method: 'POST',
    body: JSON.stringify({ title, genre, initialPrompt }),
  });
}

export async function readStory(
  storyId: string,
  opts?: { after?: number; limit?: number }
): Promise<ReadStoryResponse> {
  const params = new URLSearchParams();
  if (opts?.after !== undefined) params.set('after', String(opts.after));
  if (opts?.limit !== undefined) params.set('limit', String(opts.limit));
  const qs = params.toString();
  return apiFetch(`/api/stories/${storyId}/read${qs ? `?${qs}` : ''}`);
}

export async function continueStory(
  storyId: string,
  userInput: string
): Promise<ContinueResponse> {
  return apiFetch(`/api/stories/${storyId}/continue`, {
    method: 'POST',
    body: JSON.stringify({ userInput }),
  });
}
