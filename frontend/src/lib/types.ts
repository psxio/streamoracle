export interface Channel {
  id: number;
  platform: string;
  platform_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  category: string | null;
  follower_count: number;
  is_live: boolean;
}

export interface Snapshot {
  id: number;
  channel_id: number;
  viewer_count: number;
  chatter_count: number;
  category: string | null;
  collected_at: string;
}

export interface SignalScore {
  name: string;
  score: number;
  weight: number;
  confidence: number;
  details: Record<string, any>;
}

export interface AnalysisResult {
  overall_score: number;
  confidence: number;
  label: string;
  signal_scores: SignalScore[];
  data_points: number;
  analyzed_at: string;
}

export interface ChannelDetail extends Channel {
  latest_analysis?: AnalysisResult;
}

export interface LeaderboardEntry {
  rank: number;
  channel_id: number;
  platform: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  overall_score: number;
  label: string;
  analyzed_at: string;
}

export interface SearchResult {
  results: Channel[];
  total: number;
}

export interface HealthCheck {
  status: string;
  version: string;
  platform: string;
}

export interface MethodologyResponse {
  signals: {
    name: string;
    weight: number;
    description: string;
  }[];
  formula: string;
  labels: Record<string, string>;
}
