import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export interface LeaderboardEntry {
  userId: number;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  reviewCount: number;
  pyqCount: number;
  points: number;
}

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[]>({
    queryKey: [api.leaderboard.list.path],
    queryFn: async () => {
      const res = await fetch(api.leaderboard.list.path);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    staleTime: 60000,
  });
}
