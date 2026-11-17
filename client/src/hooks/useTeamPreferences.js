import { useState, useEffect, useCallback } from 'react';
import { useGetPinnedTeamsQuery, useTogglePinTeamMutation } from '@/stores/slices/teamApiSlice';

const RECENT_KEY = 'opsdesk_recent_teams';

/**
 * Converts a past timestamp into a concise compact string like '2m', '4h', or '1d'.
 * Used in the sidebar recent teams section to indicate elapsed time.
 */
export function formatShortTimeAgo(timestamp) {
      if (!timestamp) return '';
      const seconds = Math.floor((Date.now() - Number(timestamp)) / 1000);
      if (seconds < 60) return 'now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      return `${days}d`;
}

/**
 * Hook to manage user pinned (starred) teams backed by the database via RTK Query,
 * and recently visited teams backed by localStorage.
 * Supports optimistic updates so pinning changes appear immediately.
 */
export default function useTeamPreferences() {
      // Backend RTK Query for pinned teams
      const { data: pinnedIds = [], isLoading: isPinnedLoading } = useGetPinnedTeamsQuery();
      const [togglePinMutation] = useTogglePinTeamMutation();

      // Read initial recent visits from localStorage
      const [recentList, setRecentList] = useState(() => {
            try {
                  const saved = localStorage.getItem(RECENT_KEY);
                  return saved ? JSON.parse(saved) : [];
            } catch {
                  return [];
            }
      });

      // Persist recent teams whenever the list changes
      useEffect(() => {
            try {
                  localStorage.setItem(RECENT_KEY, JSON.stringify(recentList));
            } catch (error) {
                  console.error('Failed to save recent teams:', error);
            }
      }, [recentList]);

      /**
       * Toggles the pinned/starred status of a team using RTK Query with optimistic cache updates.
       */
      const toggleStarTeam = useCallback(async (teamId) => {
            if (!teamId) return;
            try {
                  await togglePinMutation(teamId).unwrap();
            } catch (error) {
                  console.error('Failed to toggle pin status:', error);
            }
      }, [togglePinMutation]);

      /**
       * Checks whether a specific team is currently starred/pinned by the user.
       */
      const isTeamStarred = useCallback((teamId) => {
            return pinnedIds.includes(teamId);
      }, [pinnedIds]);

      /**
       * Records a team visit with the current timestamp and keeps the list capped at the 5 most recent.
       */
      const recordRecentVisit = useCallback((teamId) => {
            if (!teamId) return;
            setRecentList((prev) => {
                  const filtered = prev.filter((entry) => entry.id !== teamId);
                  const updated = [{ id: teamId, visitedAt: Date.now() }, ...filtered];
                  return updated.slice(0, 5);
            });
      }, []);

      return {
            starredIds: pinnedIds,
            isPinnedLoading,
            toggleStarTeam,
            isTeamStarred,
            recentList,
            recordRecentVisit,
      };
}
