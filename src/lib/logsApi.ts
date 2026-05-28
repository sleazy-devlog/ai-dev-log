import type { Log } from "@/types/log";

export type LogPayload = {
  title: string;
  todayWork: string;
  aiUsage: string;
  problem: string;
  learning: string;
  tags: string[];
};

const assertOk = (response: Response) => {
  if (!response.ok) {
    throw new Error(`Logs API request failed: ${response.status}`);
  }
};

export const fetchLogs = async (): Promise<Log[]> => {
  const response = await fetch("/api/logs");
  assertOk(response);

  return await response.json() as Log[];
};

export const createLog = async (payload: LogPayload): Promise<Log> => {
  const response = await fetch("/api/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  assertOk(response);

  return await response.json() as Log;
};

export const updateLog = async (
    id: number,
    payload: LogPayload,
  ): Promise<Log> => {
  const response = await fetch(`/api/logs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  assertOk(response);

  return await response.json() as Log;
};

export const deleteLog = async (id: number): Promise<void> => {
  const response = await fetch(`/api/logs/${id}`, {
    method: "DELETE",
  });
  assertOk(response);
};
