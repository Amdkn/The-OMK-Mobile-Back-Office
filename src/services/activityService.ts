import { AppId, RecentActivityItem } from '../types';
import { useOSStore } from '../store/osStore';

export const ActivityService = {
  log: (appId: AppId, title: string, subtitle: string, type: RecentActivityItem['type'] = 'action', badge?: string, metadata?: Record<string, any>) => {
    useOSStore.getState().addRecentActivity({
      appId,
      title,
      subtitle,
      type,
      badge,
      metadata
    });
  },

  formatRelativeTime: (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days === 1) return 'Hier';
    return `Il y a ${days} j`;
  }
};
