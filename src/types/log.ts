export type Log = {
  id: number;
  title: string;
  todayWork: string;
  aiUsage: string;
  problem: string;
  learning: string;
  tags?: string[];
  createdAt: string;
};

export type SortOrder = "createdAtDesc" | "createdAtAsc" | "titleAsc";
