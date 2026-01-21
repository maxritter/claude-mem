import { useState, useEffect, useCallback } from 'react';

interface Stats {
  observations: number;
  summaries: number;
  prompts: number;
  projects: number;
}

interface WorkerStatus {
  status: 'online' | 'offline' | 'processing';
  version?: string;
  uptime?: string;
  queueDepth?: number;
}

interface VectorDbStatus {
  type: 'qdrant' | 'chroma' | 'none';
  status: 'connected' | 'disconnected' | 'error';
  documentCount?: number;
  collectionCount?: number;
}

interface ActivityItem {
  id: number;
  type: 'observation' | 'summary' | 'prompt';
  title: string;
  project: string;
  timestamp: string;
}

interface UseStatsResult {
  stats: Stats;
  workerStatus: WorkerStatus;
  vectorDbStatus: VectorDbStatus;
  recentActivity: ActivityItem[];
  isLoading: boolean;
  refreshStats: () => Promise<void>;
}

export function useStats(): UseStatsResult {
  const [stats, setStats] = useState<Stats>({
    observations: 0,
    summaries: 0,
    prompts: 0,
    projects: 0,
  });
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>({
    status: 'offline',
  });
  const [vectorDbStatus, setVectorDbStatus] = useState<VectorDbStatus>({
    type: 'none',
    status: 'disconnected',
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [statsRes, healthRes, activityRes, projectsRes, settingsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/health'),  // Note: /health (not /api/health) has queueDepth
        fetch('/api/observations?limit=5'),
        fetch('/api/projects'),
        fetch('/api/settings'),
      ]);

      const statsData = await statsRes.json();
      const healthData = await healthRes.json();
      const activityData = await activityRes.json();
      const projectsData = await projectsRes.json();
      const settingsData = await settingsRes.json();

      // Map stats from actual API structure
      setStats({
        observations: statsData.database?.observations || 0,
        summaries: statsData.database?.summaries || 0,
        prompts: statsData.database?.prompts || 0,
        projects: projectsData.projects?.length || 0,
      });

      // Map worker status from actual API structure
      // queueDepth and isProcessing come from /health, not /stats
      setWorkerStatus({
        status: healthData.status === 'ok'
          ? (healthData.isProcessing ? 'processing' : 'online')
          : 'offline',
        version: statsData.worker?.version,
        uptime: statsData.worker?.uptime ? formatUptime(statsData.worker.uptime) : undefined,
        queueDepth: healthData.queueDepth || 0,
      });

      // Get vector DB type from settings
      const vectorDbType = settingsData.CLAUDE_MEM_VECTOR_DB || 'none';
      setVectorDbStatus({
        type: vectorDbType as 'qdrant' | 'chroma' | 'none',
        status: healthData.status === 'ok' ? 'connected' : 'disconnected',
        documentCount: 0, // Would need a separate API call
        collectionCount: projectsData.projects?.length || 0,
      });

      // Map recent activity
      const items = activityData.items || activityData.observations || activityData || [];
      setRecentActivity(
        (Array.isArray(items) ? items : []).slice(0, 5).map((obs: any) => ({
          id: obs.id,
          type: obs.obs_type || obs.type || 'observation',
          title: obs.title || obs.content?.slice(0, 100) || 'Untitled',
          project: obs.project || 'unknown',
          timestamp: formatTimestamp(obs.created_at),
        }))
      );
    } catch (error) {
      console.error('Failed to load stats:', error);
      setWorkerStatus({ status: 'offline' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();

    // Subscribe to SSE for live updates
    const eventSource = new EventSource('/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Update queue depth and processing status on processing_status events
        if (data.type === 'processing_status') {
          setWorkerStatus((prev) => ({
            ...prev,
            status: data.isProcessing ? 'processing' : 'online',
            queueDepth: data.queueDepth ?? prev.queueDepth,
          }));
        }

        // Refresh stats when new observations/summaries are created
        if (data.type === 'new_observation' || data.type === 'new_summary') {
          loadStats();
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    return () => eventSource.close();
  }, [loadStats]);

  return {
    stats,
    workerStatus,
    vectorDbStatus,
    recentActivity,
    isLoading,
    refreshStats: loadStats,
  };
}

function formatTimestamp(timestamp: string): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
