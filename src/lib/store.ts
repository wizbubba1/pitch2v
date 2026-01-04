// In-memory store for submissions (will be replaced with database)
// WARNING: Data is lost when server restarts

export interface AnalysisResult {
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
  reEvaluationNotes?: string;
  dreamCreateDeliver?: {
    dream: string;
    create: string;
    deliver: string;
  };
  // Detailed AI reasoning for each category
  detailedReasoning?: {
    overview: string; // Overall reasoning about the pitch
    documentComprehension: string; // What the AI understood from the documents
    scoringRationale: Record<string, string>; // Detailed rationale for each category score
    keyInsights: string[]; // Critical insights discovered
    concerns: string[]; // Concerns or red flags
    finalThoughts: string; // Concluding analysis
  };
}

export interface StoredFile {
  name: string;
  size: number;
  base64: string; // Base64 encoded file data
  extractedText: string; // Extracted text content
}

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
  pitchDeckFile: StoredFile; // Original pitch deck with base64 data
  analysis: AnalysisResult; // Initial analysis
  // Re-evaluation after additional docs
  additionalDocsFiles: StoredFile[]; // Additional documents with base64 data
  reEvaluation?: {
    analysis: AnalysisResult;
    evaluatedAt: string;
    combinedDocuments: string[]; // Names of docs included in re-evaluation
  };
  status: "pending" | "reviewing" | "accepted" | "rejected" | "additional-docs-requested" | "re-evaluated";
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
