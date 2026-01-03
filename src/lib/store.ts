// In-memory store for submissions (will be replaced with database)
// WARNING: Data is lost when server restarts

export interface Submission {
  id: string;
  createdAt: string;
  contactInfo: {
    name: string;
    companyRole: string;
    companyName: string;
    email: string;
    linkedIn: string;
  };
  fileName: string;
  fileSize: number;
  analysis: {
    startupName?: string;
    executiveSummary?: string;
    recommendation?: string;
    overallScore: number;
    scores: Record<string, number>;
    categoryAnalysis?: Record<string, unknown>;
    strengths: string[];
    improvements: string[];
    portfolioSynergies?: string[];
    nextSteps?: string[];
    dreamCreateDeliver?: {
      dream: string;
      create: string;
      deliver: string;
    };
  };
  additionalDocs: string[];
  status: "pending" | "reviewing" | "accepted" | "rejected" | "additional-docs-requested";
  notes: string;
}

// In-memory storage (replace with database in production)
const submissions: Map<string, Submission> = new Map();

export function generateId(): string {
  return `VVS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function addSubmission(submission: Submission): void {
  submissions.set(submission.id, submission);
  console.log(`[STORE] Added submission ${submission.id}. Total: ${submissions.size}`);
}

export function getSubmission(id: string): Submission | undefined {
  return submissions.get(id);
}

export function updateSubmission(id: string, updates: Partial<Submission>): boolean {
  const existing = submissions.get(id);
  if (!existing) return false;
  submissions.set(id, { ...existing, ...updates });
  return true;
}

export function getAllSubmissions(): Submission[] {
  return Array.from(submissions.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getSubmissionsByScore(min: number, max: number): Submission[] {
  return getAllSubmissions().filter(
    (s) => s.analysis.overallScore >= min && s.analysis.overallScore < max
  );
}

export function getSubmissionStats() {
  const all = getAllSubmissions();
  return {
    total: all.length,
    highScore: all.filter((s) => s.analysis.overallScore >= 70).length,
    midScore: all.filter((s) => s.analysis.overallScore >= 50 && s.analysis.overallScore < 70).length,
    lowScore: all.filter((s) => s.analysis.overallScore < 50).length,
    pending: all.filter((s) => s.status === "pending").length,
    reviewing: all.filter((s) => s.status === "reviewing").length,
    accepted: all.filter((s) => s.status === "accepted").length,
    rejected: all.filter((s) => s.status === "rejected").length,
  };
}
