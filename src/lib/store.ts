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

// Individual analysis run
export interface AnalysisRun {
  id: string;
  createdAt: string;
  modelId: string;
  modelName: string;
  analystId?: string; // Optional - if using analyst persona
  analystName?: string;
  analysis: AnalysisResult;
  isKept: boolean; // Whether admin wants to keep this run
  isReEvaluation: boolean; // Whether this was a re-evaluation with additional docs
  additionalDocsUsed?: string[]; // Names of additional docs used (for re-evaluations)
}

// AI Analyst Personas
export interface AnalystPersona {
  id: string;
  name: string;
  shortDescription: string;
  philosophy: string;
  behavioralPrompt: string;
  icon: string; // Emoji for visual identification
}

export const ANALYST_PERSONAS: AnalystPersona[] = [
  {
    id: "pragmatist",
    name: "The Pragmatist",
    shortDescription: "Balanced, data-driven analysis focused on fundamentals",
    philosophy: "Success comes from solid execution on proven fundamentals. I value clear metrics, realistic projections, and demonstrated traction over visionary promises.",
    icon: "⚖️",
    behavioralPrompt: `You are "The Pragmatist" - a balanced, methodical venture analyst who prioritizes data and fundamentals.

EVALUATION PHILOSOPHY:
- Heavily weight demonstrated traction and real metrics over projections
- Look for clear unit economics and a realistic path to profitability
- Value teams with relevant domain experience and execution track records
- Be skeptical of overly optimistic market size claims without substantiation
- Appreciate clear, honest articulation of challenges and risks
- Favor business models with proven revenue mechanisms

SCORING APPROACH:
- Start from a neutral baseline and adjust based on evidence
- Require concrete proof points for above-average scores
- Penalize vagueness, buzzwords without substance, and unrealistic timelines
- Reward clarity, specificity, and intellectual honesty
- Weight financials and traction heavily in your assessment`,
  },
  {
    id: "skeptic",
    name: "The Skeptic",
    shortDescription: "Risk-focused, challenges assumptions, looks for red flags",
    philosophy: "My job is to protect capital by identifying what could go wrong. Every pitch gets the same rigorous scrutiny - only the truly exceptional survive.",
    icon: "🔍",
    behavioralPrompt: `You are "The Skeptic" - a conservative, risk-focused analyst who stress-tests every assumption.

EVALUATION PHILOSOPHY:
- Your primary job is to protect the fund from bad investments
- Actively look for red flags, inconsistencies, and gaps in logic
- Challenge every major assumption - market size, competitive advantage, team capability
- Weight downside risks more heavily than upside potential
- Be particularly wary of: hype-driven narratives, inexperienced teams in complex markets, "trust me" financials
- Question whether the timing is right and if barriers to entry are real

SCORING APPROACH:
- Default to conservative scores unless strongly convinced otherwise
- Require exceptional evidence to award high scores
- Heavily penalize missing information, evasive language, or unrealistic claims
- Look for evidence of awareness of risks and mitigation strategies
- A pitch that doesn't address obvious challenges should score lower
- Your recommendations should highlight the key risks prominently`,
  },
  {
    id: "visionary",
    name: "The Visionary",
    shortDescription: "Opportunity-focused, values bold ideas and market potential",
    philosophy: "The biggest returns come from seeing what others miss. I look for transformative potential and founders with the audacity to change industries.",
    icon: "🚀",
    behavioralPrompt: `You are "The Visionary" - an optimistic, opportunity-focused analyst who looks for transformative potential.

EVALUATION PHILOSOPHY:
- Prioritize market opportunity and potential for outsized returns
- Value bold, ambitious visions that could reshape industries
- Give credit for innovative approaches even if unproven
- Look for founders with passion, conviction, and unique insights
- Consider the best-case scenario and what would need to be true
- Weight potential and trajectory over current state

SCORING APPROACH:
- Be generous when you see genuine innovation or unique market insight
- Focus on strengths and potential rather than dwelling on current gaps
- Recognize that early-stage companies will have incomplete data
- Value the quality of thinking and vision articulation
- Give benefit of the doubt to compelling narratives with logical foundations
- Your recommendations should emphasize opportunities and upside potential
- Still flag critical risks, but frame them as challenges to overcome`,
  },
  {
    id: "operator",
    name: "The Operator",
    shortDescription: "Execution-focused, values team capability and operational rigor",
    philosophy: "Ideas are cheap, execution is everything. I've built companies and I know what it takes. Show me you can actually deliver.",
    icon: "⚙️",
    behavioralPrompt: `You are "The Operator" - a hands-on, execution-focused analyst with deep operational experience.

EVALUATION PHILOSOPHY:
- Team is paramount - evaluate founder backgrounds, complementary skills, and relevant experience
- Look for evidence of operational rigor: clear milestones, realistic timelines, resource planning
- Value demonstrated ability to ship product and acquire customers
- Assess whether the team understands the operational complexity of their business
- Look for signs of capital efficiency and smart resource allocation
- Consider go-to-market strategy practicality and sales capability

SCORING APPROACH:
- Weight team assessment very heavily in overall evaluation
- Look for evidence of "builder" mentality - shipping, iterating, learning
- Penalize teams that seem more focused on fundraising than building
- Reward clear operational plans and realistic milestone mapping
- Assess whether financial projections reflect operational reality
- Your recommendations should focus on execution capabilities and risks
- Flag any team gaps or operational concerns prominently`,
  },
];

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
  additionalDocsFiles: StoredFile[]; // Additional documents with base64 data

  // Analysis runs - supports multiple runs with different models/analysts
  analysisRuns: AnalysisRun[];

  // Primary/selected analysis (the one admin chooses to use for decision making)
  primaryRunId?: string;

  // Legacy fields for backward compatibility
  analyzed: boolean; // Whether at least one analysis has been run
  modelUsed?: string; // Model from primary/latest analysis
  analysis?: AnalysisResult; // Primary analysis result
  reEvaluation?: {
    analysis: AnalysisResult;
    evaluatedAt: string;
    combinedDocuments: string[];
    modelUsed?: string;
  };

  status: "awaiting-analysis" | "pending" | "reviewing" | "accepted" | "rejected" | "additional-docs-requested" | "re-evaluated";
  notes: string;
}

// In-memory storage (replace with database in production)
const submissions: Map<string, Submission> = new Map();

export function generateId(): string {
  return `VVS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function generateRunId(): string {
  return `RUN-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
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

export function addAnalysisRun(submissionId: string, run: AnalysisRun): boolean {
  const submission = submissions.get(submissionId);
  if (!submission) return false;

  submission.analysisRuns.push(run);

  // Update legacy fields with the latest run
  submission.analyzed = true;
  submission.modelUsed = run.modelId;
  submission.analysis = run.analysis;

  // Set as primary if it's the first kept run or no primary exists
  if (!submission.primaryRunId && run.isKept) {
    submission.primaryRunId = run.id;
  }

  // Update status if moving from awaiting-analysis
  if (submission.status === "awaiting-analysis") {
    submission.status = "pending";
  }

  submissions.set(submissionId, submission);
  return true;
}

export function updateAnalysisRun(submissionId: string, runId: string, updates: Partial<AnalysisRun>): boolean {
  const submission = submissions.get(submissionId);
  if (!submission) return false;

  const runIndex = submission.analysisRuns.findIndex(r => r.id === runId);
  if (runIndex === -1) return false;

  submission.analysisRuns[runIndex] = { ...submission.analysisRuns[runIndex], ...updates };
  submissions.set(submissionId, submission);
  return true;
}

export function deleteAnalysisRun(submissionId: string, runId: string): boolean {
  const submission = submissions.get(submissionId);
  if (!submission) return false;

  submission.analysisRuns = submission.analysisRuns.filter(r => r.id !== runId);

  // If we deleted the primary run, clear it
  if (submission.primaryRunId === runId) {
    submission.primaryRunId = undefined;
    // Set a new primary from kept runs if available
    const keptRun = submission.analysisRuns.find(r => r.isKept);
    if (keptRun) {
      submission.primaryRunId = keptRun.id;
      submission.analysis = keptRun.analysis;
      submission.modelUsed = keptRun.modelId;
    }
  }

  // Update analyzed status
  submission.analyzed = submission.analysisRuns.length > 0;
  if (!submission.analyzed) {
    submission.status = "awaiting-analysis";
    submission.analysis = undefined;
    submission.modelUsed = undefined;
  }

  submissions.set(submissionId, submission);
  return true;
}

export function setPrimaryRun(submissionId: string, runId: string): boolean {
  const submission = submissions.get(submissionId);
  if (!submission) return false;

  const run = submission.analysisRuns.find(r => r.id === runId);
  if (!run) return false;

  submission.primaryRunId = runId;
  submission.analysis = run.analysis;
  submission.modelUsed = run.modelId;

  submissions.set(submissionId, submission);
  return true;
}

export function getAllSubmissions(): Submission[] {
  return Array.from(submissions.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getSubmissionsByScore(min: number, max: number): Submission[] {
  return getAllSubmissions().filter(
    (s) => s.analyzed && s.analysis && s.analysis.overallScore >= min && s.analysis.overallScore < max
  );
}

export function getUnanalyzedSubmissions(): Submission[] {
  return getAllSubmissions().filter((s) => !s.analyzed);
}

export function getAnalyzedSubmissions(): Submission[] {
  return getAllSubmissions().filter((s) => s.analyzed);
}

export function getSubmissionStats() {
  const all = getAllSubmissions();
  const analyzed = all.filter((s) => s.analyzed && s.analysis);
  return {
    total: all.length,
    awaitingAnalysis: all.filter((s) => !s.analyzed).length,
    highScore: analyzed.filter((s) => s.analysis!.overallScore >= 70).length,
    midScore: analyzed.filter((s) => s.analysis!.overallScore >= 50 && s.analysis!.overallScore < 70).length,
    lowScore: analyzed.filter((s) => s.analysis!.overallScore < 50).length,
    pending: all.filter((s) => s.status === "pending").length,
    reviewing: all.filter((s) => s.status === "reviewing").length,
    accepted: all.filter((s) => s.status === "accepted").length,
    rejected: all.filter((s) => s.status === "rejected").length,
  };
}

// Get all analysis runs across all submissions for history view
export function getAllAnalysisRuns(): Array<{ submission: Submission; run: AnalysisRun }> {
  const all = getAllSubmissions();
  const runs: Array<{ submission: Submission; run: AnalysisRun }> = [];

  for (const submission of all) {
    for (const run of submission.analysisRuns) {
      runs.push({ submission, run });
    }
  }

  // Sort by run creation time, newest first
  return runs.sort((a, b) => new Date(b.run.createdAt).getTime() - new Date(a.run.createdAt).getTime());
}
