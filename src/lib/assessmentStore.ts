import type { RiskResult } from "@/components/portal/RiskResultsTable";

const STORAGE_KEY = "savedAssessments";

export interface SavedAssessment {
  id: string;
  createdAt: string; // ISO
  assessType: string;
  assessTarget: string;
  assessDate: string;
  assessRole: string;
  assessor: string;
  processCategory: string;
  taskDescription: string;
  uploadedImages: string[];
  results: RiskResult[];
  status: "완료" | "진행중";
  averageRisk: number;
}

export function loadAssessments(): SavedAssessment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedAssessment[];
  } catch {
    return [];
  }
}

export function saveAssessments(list: SavedAssessment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addAssessment(item: Omit<SavedAssessment, "id" | "createdAt">): SavedAssessment {
  const list = loadAssessments();
  const newItem: SavedAssessment = {
    ...item,
    id: `asm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newItem);
  saveAssessments(list);
  return newItem;
}

export function deleteAssessment(id: string) {
  const list = loadAssessments().filter((a) => a.id !== id);
  saveAssessments(list);
}

export function getAssessment(id: string): SavedAssessment | undefined {
  return loadAssessments().find((a) => a.id === id);
}

export function calcAverageRisk(results: RiskResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((a, r) => a + r.currentFrequency * r.currentSeverity, 0);
  return Number((sum / results.length).toFixed(2));
}
