import type {
  HealthCheck,
  SearchResult,
  ChannelDetail,
  Snapshot,
  AnalysisResult,
  LeaderboardEntry,
  MethodologyResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => 'Unknown error');
    throw new ApiError(body, res.status);
  }

  return res.json();
}

export async function healthCheck(): Promise<HealthCheck> {
  return request<HealthCheck>('/api/v1/health');
}

export async function searchChannels(
  query: string,
  platform?: string
): Promise<SearchResult> {
  const params = new URLSearchParams({ q: query });
  if (platform) params.set('platform', platform);
  return request<SearchResult>(`/api/v1/search?${params}`);
}

export async function getChannel(
  platform: string,
  username: string
): Promise<ChannelDetail> {
  return request<ChannelDetail>(`/api/v1/channels/${platform}/${username}`);
}

export async function getSnapshots(
  platform: string,
  username: string,
  hours?: number
): Promise<Snapshot[]> {
  const params = hours ? `?hours=${hours}` : '';
  return request<Snapshot[]>(
    `/api/v1/channels/${platform}/${username}/snapshots${params}`
  );
}

export async function trackChannel(
  platform: string,
  username: string
): Promise<void> {
  await request(`/api/v1/channels/${platform}/${username}/track`, {
    method: 'POST',
  });
}

export async function getAnalysis(
  platform: string,
  username: string
): Promise<AnalysisResult> {
  return request<AnalysisResult>(
    `/api/v1/analysis/${platform}/${username}/latest`
  );
}

export async function getLeaderboard(
  platform?: string,
  category?: string,
  limit?: number
): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams();
  if (platform) params.set('platform', platform);
  if (category) params.set('category', category);
  if (limit) params.set('limit', limit.toString());
  const qs = params.toString();
  return request<LeaderboardEntry[]>(
    `/api/v1/leaderboard${qs ? `?${qs}` : ''}`
  );
}

export async function getMethodology(): Promise<MethodologyResponse> {
  return request<MethodologyResponse>('/api/v1/methodology');
}
