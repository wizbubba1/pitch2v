"use client";

import { useState, useRef, useEffect } from "react";
import {
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Linkedin,
  FileText,
  Lock,
  Loader2,
  RefreshCw,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  RotateCcw,
  Upload,
  Plus,
  X,
  Brain,
  Lightbulb,
  AlertTriangle,
  MessageSquare,
  Clock,
  Play,
  Cpu,
  History,
  Trash2,
  Star,
  StarOff,
  Settings2,
  User,
  Layers,
} from "lucide-react";

interface DetailedReasoning {
  overview: string;
  documentComprehension: string;
  scoringRationale: Record<string, string>;
  keyInsights: string[];
  concerns: string[];
  finalThoughts: string;
}

interface AnalysisResult {
  startupName?: string;
  executiveSummary?: string;
  recommendation?: string;
  overallScore: number;
  scores: Record<string, number>;
  categoryAnalysis?: Record<string, {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    newInfoFromDocs?: string;
  }>;
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
  detailedReasoning?: DetailedReasoning;
}

interface StoredFile {
  name: string;
  size: number;
  base64: string;
  extractedText: string;
}

interface AnalysisRun {
  id: string;
  createdAt: string;
  modelId: string;
  modelName: string;
  analystId?: string;
  analystName?: string;
  analysis: AnalysisResult;
  isKept: boolean;
  isReEvaluation: boolean;
  additionalDocsUsed?: string[];
}

interface Submission {
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
  pitchDeckFile?: StoredFile;
  analyzed: boolean;
  modelUsed?: string;
  analysis?: AnalysisResult;
  analysisRuns?: AnalysisRun[];
  primaryRunId?: string;
  additionalDocsFiles?: StoredFile[];
  reEvaluation?: {
    analysis: AnalysisResult;
    evaluatedAt: string;
    combinedDocuments: string[];
    modelUsed?: string;
  };
  status: string;
  notes: string;
}

interface Stats {
  total: number;
  awaitingAnalysis: number;
  highScore: number;
  midScore: number;
  lowScore: number;
  pending: number;
  reviewing: number;
  accepted: number;
  rejected: number;
}

interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

interface AnalystOption {
  id: string;
  name: string;
  shortDescription: string;
  philosophy: string;
  icon: string;
}

const AVAILABLE_MODELS: ModelOption[] = [
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", provider: "anthropic" },
  { id: "anthropic/claude-opus-4.5", name: "Claude Opus 4.5", provider: "anthropic" },
  { id: "openai/gpt-5.2-pro", name: "GPT 5.2 Pro", provider: "openai" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google" },
];

const SCORE_LABELS: Record<string, string> = {
  visionFit: "Vision Fit",
  marketGTM: "Market & GTM",
  scientificRigor: "Scientific Rigor",
  technicalFeasibility: "Technical Feasibility",
  complianceEthics: "Compliance & Ethics",
  teamExecution: "Team & Execution",
  ipDefensibility: "IP / Defensibility",
  tractionValidation: "Traction & Validation",
  fundingReadiness: "Funding Readiness",
  scalabilityPotential: "Scalability Potential",
};

type MainTab = "submissions" | "history";
type FilterTab = "all" | "awaiting" | "high" | "mid" | "low" | "accepted" | "rejected" | "reviewing";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("submissions");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedModel, setSelectedModel] = useState<string>("anthropic/claude-sonnet-4");
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>("");
  const [analysts, setAnalysts] = useState<AnalystOption[]>([]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/submissions", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
        setStats(data.stats);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        alert("Invalid password");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  const fetchAnalysts = async () => {
    try {
      const response = await fetch("/api/admin/analyze", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysts(data.analysts || []);
      }
    } catch (error) {
      console.error("Fetch analysts error:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalysts();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubmissions();
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${password}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
      fetchSubmissions();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === "all") return true;
    if (filter === "awaiting") return !s.analyzed;
    if (filter === "high") return s.analyzed && s.analysis && s.analysis.overallScore >= 70;
    if (filter === "mid") return s.analyzed && s.analysis && s.analysis.overallScore >= 50 && s.analysis.overallScore < 70;
    if (filter === "low") return s.analyzed && s.analysis && s.analysis.overallScore < 50;
    if (filter === "accepted") return s.status === "accepted";
    if (filter === "rejected") return s.status === "rejected";
    if (filter === "reviewing") return s.status === "reviewing";
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600 bg-emerald-100";
    if (score >= 50) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-100 text-emerald-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "reviewing":
        return "bg-blue-100 text-blue-800";
      case "awaiting-analysis":
        return "bg-yellow-100 text-yellow-800";
      case "re-evaluated":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get all runs across all submissions for history view
  const getAllRuns = () => {
    const runs: Array<{ submission: Submission; run: AnalysisRun }> = [];
    for (const submission of submissions) {
      for (const run of submission.analysisRuns || []) {
        runs.push({ submission, run });
      }
    }
    return runs.sort((a, b) => new Date(b.run.createdAt).getTime() - new Date(a.run.createdAt).getTime());
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-[#4da6e8]" />
            <h1 className="text-xl font-semibold">Admin Access</h1>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4 font-code text-sm focus:outline-none focus:border-[#4da6e8]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary px-4 py-3 rounded-lg font-code text-sm flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-400 font-code text-center">
            Default: vitruvius2025 (change via ADMIN_PASSWORD env)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-gray-300 rounded" />
            <span className="font-code text-xl font-semibold">
              pitch<span className="text-[#4da6e8]">2</span>v
            </span>
            <span className="px-2 py-0.5 text-xs font-code bg-[#4da6e8] text-white rounded">
              admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-500" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-1.5 text-sm font-code border border-gray-200 rounded-lg focus:outline-none focus:border-[#4da6e8]"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Analyst Selector */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <select
                value={selectedAnalyst}
                onChange={(e) => setSelectedAnalyst(e.target.value)}
                className="px-3 py-1.5 text-sm font-code border border-gray-200 rounded-lg focus:outline-none focus:border-[#4da6e8]"
              >
                <option value="">Standard Analysis</option>
                {analysts.map((analyst) => (
                  <option key={analyst.id} value={analyst.id}>
                    {analyst.icon} {analyst.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchSubmissions}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setMainTab("submissions")}
              className={`px-6 py-3 text-sm font-code border-b-2 transition-colors ${
                mainTab === "submissions"
                  ? "border-[#4da6e8] text-[#4da6e8]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Submissions
              </div>
            </button>
            <button
              onClick={() => setMainTab("history")}
              className={`px-6 py-3 text-sm font-code border-b-2 transition-colors ${
                mainTab === "history"
                  ? "border-[#4da6e8] text-[#4da6e8]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Analysis History
              </div>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {mainTab === "submissions" ? (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <StatCard
                  icon={<Users className="w-5 h-5" />}
                  label="Total Submissions"
                  value={stats.total}
                  color="text-gray-600"
                />
                <StatCard
                  icon={<Clock className="w-5 h-5" />}
                  label="Awaiting Analysis"
                  value={stats.awaitingAnalysis}
                  color="text-yellow-600"
                />
                <StatCard
                  icon={<CheckCircle className="w-5 h-5" />}
                  label="Accepted"
                  value={stats.accepted}
                  color="text-emerald-600"
                />
                <StatCard
                  icon={<AlertCircle className="w-5 h-5" />}
                  label="Reviewing"
                  value={stats.reviewing}
                  color="text-blue-600"
                />
                <StatCard
                  icon={<XCircle className="w-5 h-5" />}
                  label="Rejected"
                  value={stats.rejected}
                  color="text-red-600"
                />
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: "all", label: "All" },
                { key: "awaiting", label: "Awaiting" },
                { key: "high", label: "70+ Score" },
                { key: "mid", label: "50-70 Score" },
                { key: "low", label: "<50 Score" },
                { key: "accepted", label: "Accepted" },
                { key: "reviewing", label: "Reviewing" },
                { key: "rejected", label: "Rejected" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as FilterTab)}
                  className={`px-4 py-2 rounded-lg font-code text-sm transition-colors ${
                    filter === f.key
                      ? "bg-[#4da6e8] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Analyst Info Banner */}
            {selectedAnalyst && (
              <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {analysts.find(a => a.id === selectedAnalyst)?.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-indigo-900">
                      {analysts.find(a => a.id === selectedAnalyst)?.name}
                    </h3>
                    <p className="text-sm text-indigo-700">
                      {analysts.find(a => a.id === selectedAnalyst)?.shortDescription}
                    </p>
                    <p className="text-xs text-indigo-600 mt-1 italic">
                      &quot;{analysts.find(a => a.id === selectedAnalyst)?.philosophy}&quot;
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submissions List */}
            <div className="space-y-4">
              {filteredSubmissions.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-code">No submissions found</p>
                </div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    isExpanded={expandedId === submission.id}
                    onToggle={() =>
                      setExpandedId(expandedId === submission.id ? null : submission.id)
                    }
                    onStatusChange={(status) => updateStatus(submission.id, status)}
                    getScoreColor={getScoreColor}
                    getStatusBadge={getStatusBadge}
                    password={password}
                    onReEvalComplete={fetchSubmissions}
                    selectedModel={selectedModel}
                    selectedAnalyst={selectedAnalyst}
                    analysts={analysts}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          /* History Tab */
          <HistoryView
            runs={getAllRuns()}
            password={password}
            onRefresh={fetchSubmissions}
            getScoreColor={getScoreColor}
          />
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-gray-500 font-code">{label}</p>
    </div>
  );
}

function HistoryView({
  runs,
  password,
  onRefresh,
  getScoreColor,
}: {
  runs: Array<{ submission: Submission; run: AnalysisRun }>;
  password: string;
  onRefresh: () => void;
  getScoreColor: (score: number) => string;
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | "accepted" | "rejected" | "reviewing" | "pending">("all");
  const [deletingRunId, setDeletingRunId] = useState<string | null>(null);

  const filteredRuns = runs.filter(({ submission }) => {
    if (statusFilter === "all") return true;
    return submission.status === statusFilter;
  });

  const handleDeleteRun = async (submissionId: string, runId: string) => {
    if (!confirm("Are you sure you want to delete this analysis run?")) return;

    setDeletingRunId(runId);
    try {
      const response = await fetch(`/api/admin/runs?submissionId=${submissionId}&runId=${runId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${password}` },
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
    setDeletingRunId(null);
  };

  const handleToggleKeep = async (submissionId: string, runId: string, currentIsKept: boolean) => {
    try {
      await fetch("/api/admin/runs", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${password}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          runId,
          isKept: !currentIsKept,
        }),
      });
      onRefresh();
    } catch (error) {
      console.error("Toggle keep error:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Analysis History</h2>
        <div className="flex gap-2">
          {["all", "accepted", "reviewing", "rejected", "pending"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as typeof statusFilter)}
              className={`px-3 py-1.5 text-xs font-code rounded-lg ${
                statusFilter === s
                  ? "bg-[#4da6e8] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredRuns.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-code">No analysis runs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRuns.map(({ submission, run }) => (
            <div
              key={run.id}
              className={`bg-white rounded-xl border ${run.isKept ? "border-gray-100" : "border-gray-200 opacity-60"} p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-lg flex items-center justify-center font-semibold text-lg ${getScoreColor(
                      run.analysis.overallScore
                    )}`}
                  >
                    {run.analysis.overallScore}%
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {run.analysis.startupName || submission.contactInfo.companyName}
                      {run.isReEvaluation && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded font-code">
                          Re-eval
                        </span>
                      )}
                      {!run.isKept && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded font-code">
                          Discarded
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 font-code">
                      {run.modelName}
                      {run.analystName && ` · ${run.analystName}`}
                    </p>
                    <p className="text-xs text-gray-400 font-code">
                      {new Date(run.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-code ${
                    submission.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                    submission.status === "rejected" ? "bg-red-100 text-red-700" :
                    submission.status === "reviewing" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {submission.status}
                  </span>
                  <button
                    onClick={() => handleToggleKeep(submission.id, run.id, run.isKept)}
                    className={`p-2 rounded-lg transition-colors ${
                      run.isKept ? "text-yellow-500 hover:bg-yellow-50" : "text-gray-400 hover:bg-gray-50"
                    }`}
                    title={run.isKept ? "Mark as discarded" : "Keep this run"}
                  >
                    {run.isKept ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteRun(submission.id, run.id)}
                    disabled={deletingRunId === run.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete this run"
                  >
                    {deletingRunId === run.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {run.additionalDocsUsed && run.additionalDocsUsed.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-code">
                    Additional docs: {run.additionalDocsUsed.join(", ")}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({
  submission,
  isExpanded,
  onToggle,
  onStatusChange,
  getScoreColor,
  getStatusBadge,
  password,
  onReEvalComplete,
  selectedModel,
  selectedAnalyst,
  analysts,
}: {
  submission: Submission;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => void;
  getScoreColor: (score: number) => string;
  getStatusBadge: (status: string) => string;
  password: string;
  onReEvalComplete: () => void;
  selectedModel: string;
  selectedAnalyst: string;
  analysts: AnalystOption[];
}) {
  const [adminFiles, setAdminFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [reEvalError, setReEvalError] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [showRunsPanel, setShowRunsPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runs = submission.analysisRuns || [];
  const primaryRun = runs.find(r => r.id === submission.primaryRunId) || runs.find(r => r.isKept) || runs[0];
  const isAnalyzed = submission.analyzed && (submission.analysis || primaryRun);
  const displayAnalysis = selectedRunId
    ? runs.find(r => r.id === selectedRunId)?.analysis
    : primaryRun?.analysis || submission.analysis;
  const displayRun = selectedRunId ? runs.find(r => r.id === selectedRunId) : primaryRun;

  const currentScore = displayAnalysis?.overallScore || 0;

  const getDownloadUrl = (type: "pitch" | "additional", index = 0) => {
    return `/api/admin/download?id=${submission.id}&type=${type}&index=${index}&password=${encodeURIComponent(password)}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdminFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      setReEvalError(null);
    }
  };

  const removeFile = (index: number) => {
    setAdminFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/admin/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${password}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId: submission.id,
          model: selectedModel,
          analystId: selectedAnalyst || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      onReEvalComplete();
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAdminReEval = async () => {
    if (adminFiles.length === 0) return;

    setIsReEvaluating(true);
    setReEvalError(null);

    try {
      const formData = new FormData();
      formData.append("submissionId", submission.id);
      formData.append("model", selectedModel);
      if (selectedAnalyst) {
        formData.append("analystId", selectedAnalyst);
      }
      adminFiles.forEach((file, i) => {
        formData.append(`doc_${i}`, file);
      });

      const response = await fetch("/api/admin/reeval", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${password}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Re-evaluation failed");
      }

      setAdminFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onReEvalComplete();
    } catch (error) {
      setReEvalError(error instanceof Error ? error.message : "Re-evaluation failed");
    } finally {
      setIsReEvaluating(false);
    }
  };

  const handleSetPrimary = async (runId: string) => {
    try {
      await fetch("/api/admin/runs", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${password}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId: submission.id,
          runId,
          action: "setPrimary",
        }),
      });
      onReEvalComplete();
    } catch (error) {
      console.error("Set primary error:", error);
    }
  };

  const handleDeleteRun = async (runId: string) => {
    if (!confirm("Delete this analysis run?")) return;
    try {
      await fetch(`/api/admin/runs?submissionId=${submission.id}&runId=${runId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${password}` },
      });
      if (selectedRunId === runId) setSelectedRunId(null);
      onReEvalComplete();
    } catch (error) {
      console.error("Delete run error:", error);
    }
  };

  // Render unanalyzed submission card
  if (!isAnalyzed) {
    return (
      <div className="bg-white rounded-xl border border-yellow-200 overflow-hidden">
        <div
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-yellow-50"
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {submission.contactInfo.companyName}
                <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded font-code">
                  Awaiting Analysis
                </span>
              </h3>
              <p className="text-sm text-gray-500 font-code">
                {submission.contactInfo.name} · {submission.contactInfo.companyRole}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-code">
              {new Date(submission.createdAt).toLocaleDateString()}
            </span>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-yellow-200 p-6">
            {/* Contact Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-400 font-code mb-1">Email</p>
                <a href={`mailto:${submission.contactInfo.email}`} className="text-sm text-[#4da6e8] flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {submission.contactInfo.email}
                </a>
              </div>
              {submission.contactInfo.linkedIn && (
                <div>
                  <p className="text-xs text-gray-400 font-code mb-1">LinkedIn</p>
                  <a href={submission.contactInfo.linkedIn} target="_blank" rel="noopener noreferrer" className="text-sm text-[#4da6e8] flex items-center gap-1">
                    <Linkedin className="w-3 h-3" />
                    Profile <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 font-code mb-1">Pitch Deck</p>
                <a href={getDownloadUrl("pitch")} className="text-sm text-[#4da6e8] flex items-center gap-1 hover:underline" onClick={(e) => e.stopPropagation()}>
                  <Download className="w-3 h-3" />
                  {submission.fileName}
                </a>
              </div>
            </div>

            {/* Run Analysis Section */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-yellow-600" />
                  <p className="font-semibold text-yellow-800">Run AI Analysis</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 font-code">
                  <Cpu className="w-3 h-3" />
                  {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                  {selectedAnalyst && (
                    <>
                      <span className="text-gray-400">·</span>
                      <User className="w-3 h-3" />
                      {analysts.find(a => a.id === selectedAnalyst)?.name}
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                disabled={isAnalyzing}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg font-code text-sm hover:from-yellow-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Analysis
                  </>
                )}
              </button>

              {analysisError && (
                <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                  {analysisError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render analyzed submission card
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-semibold text-lg ${getScoreColor(currentScore)}`}>
            {currentScore}%
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {displayAnalysis?.startupName || submission.contactInfo.companyName}
              {runs.length > 1 && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded font-code">
                  {runs.length} runs
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 font-code">
              {submission.contactInfo.name} · {submission.contactInfo.companyRole}
            </p>
            {displayRun && (
              <p className="text-xs text-gray-400 font-code flex items-center gap-1 mt-0.5">
                <Cpu className="w-3 h-3" />
                {displayRun.modelName}
                {displayRun.analystName && (
                  <>
                    <span className="text-gray-300">·</span>
                    <User className="w-3 h-3" />
                    {displayRun.analystName}
                  </>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-code ${getStatusBadge(submission.status)}`}>
            {submission.status}
          </span>
          <span className="text-xs text-gray-400 font-code">
            {new Date(submission.createdAt).toLocaleDateString()}
          </span>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && displayAnalysis && (
        <div className="border-t border-gray-100 p-6">
          {/* Contact Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 font-code mb-1">Email</p>
              <a href={`mailto:${submission.contactInfo.email}`} className="text-sm text-[#4da6e8] flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {submission.contactInfo.email}
              </a>
            </div>
            {submission.contactInfo.linkedIn && (
              <div>
                <p className="text-xs text-gray-400 font-code mb-1">LinkedIn</p>
                <a href={submission.contactInfo.linkedIn} target="_blank" rel="noopener noreferrer" className="text-sm text-[#4da6e8] flex items-center gap-1">
                  <Linkedin className="w-3 h-3" />
                  Profile <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 font-code mb-1">Pitch Deck</p>
              <a href={getDownloadUrl("pitch")} className="text-sm text-[#4da6e8] flex items-center gap-1 hover:underline" onClick={(e) => e.stopPropagation()}>
                <Download className="w-3 h-3" />
                {submission.fileName}
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-code mb-1">Recommendation</p>
              <p className="text-sm font-medium">{displayAnalysis.recommendation || "N/A"}</p>
            </div>
          </div>

          {/* Analysis Runs Panel */}
          {runs.length > 0 && (
            <div className="mb-6">
              <button
                onClick={(e) => { e.stopPropagation(); setShowRunsPanel(!showRunsPanel); }}
                className="flex items-center gap-2 text-sm font-code text-gray-600 hover:text-gray-900 mb-3"
              >
                <Settings2 className="w-4 h-4" />
                Manage Analysis Runs ({runs.length})
                {showRunsPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showRunsPanel && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  {runs.map((run) => (
                    <div
                      key={run.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        (selectedRunId === run.id || (!selectedRunId && run.id === primaryRun?.id))
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-white border border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setSelectedRunId(run.id === selectedRunId ? null : run.id); }}
                      >
                        <div className={`w-10 h-10 rounded flex items-center justify-center text-sm font-semibold ${getScoreColor(run.analysis.overallScore)}`}>
                          {run.analysis.overallScore}%
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{run.modelName}</p>
                            {run.analystName && (
                              <span className="text-xs text-purple-600 font-code">
                                {analysts.find(a => a.id === run.analystId)?.icon} {run.analystName}
                              </span>
                            )}
                            {run.isReEvaluation && (
                              <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-600 rounded">Re-eval</span>
                            )}
                            {run.id === submission.primaryRunId && (
                              <span className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-600 rounded">Primary</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-code">
                            {new Date(run.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {run.id !== submission.primaryRunId && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSetPrimary(run.id); }}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Set as primary"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRun(run.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete run"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Executive Summary */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-code mb-2">Executive Summary</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{displayAnalysis.executiveSummary || "N/A"}</p>
          </div>

          {/* Scores Grid */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-code mb-3">Category Scores</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(displayAnalysis.scores || {}).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 font-code truncate">{SCORE_LABELS[key] || key}</p>
                  <p className={`text-lg font-semibold ${value >= 70 ? "text-emerald-600" : value >= 50 ? "text-amber-600" : "text-red-600"}`}>
                    {value}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs text-gray-400 font-code mb-2">Key Strengths</p>
              <ul className="space-y-1">
                {displayAnalysis.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-emerald-500">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-code mb-2">Areas to Improve</p>
              <ul className="space-y-1">
                {displayAnalysis.improvements?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-amber-500">-</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Thinking Button */}
          {displayAnalysis.detailedReasoning && (
            <div className="mb-6">
              <button
                onClick={(e) => { e.stopPropagation(); setShowThinking(true); }}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-code hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Brain className="w-5 h-5" />
                View AI Thinking & Reasoning
              </button>
            </div>
          )}

          {/* Run New Analysis */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">Run New Analysis</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-code">
                <Cpu className="w-3 h-3" />
                {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                {selectedAnalyst && (
                  <>
                    <span className="text-gray-400">·</span>
                    {analysts.find(a => a.id === selectedAnalyst)?.icon}
                  </>
                )}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
              disabled={isAnalyzing}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-code hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run with {selectedAnalyst ? analysts.find(a => a.id === selectedAnalyst)?.name : "Standard Analysis"}
                </>
              )}
            </button>
            {analysisError && (
              <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">{analysisError}</div>
            )}
          </div>

          {/* Re-Evaluation with Additional Docs */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-purple-600" />
              <p className="text-sm font-semibold text-purple-800">Re-Evaluate with Additional Docs</p>
            </div>
            <p className="text-xs text-purple-600 mb-3">
              Upload additional documentation to trigger a new AI analysis combining all materials.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id={`admin-upload-${submission.id}`}
            />
            <label
              htmlFor={`admin-upload-${submission.id}`}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-purple-300 rounded-lg text-sm text-purple-700 cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="w-4 h-4" />
              Add Documents
            </label>

            {adminFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500 font-code">Selected files:</p>
                {adminFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200">
                    <span className="text-sm font-code truncate">{file.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={(e) => { e.stopPropagation(); handleAdminReEval(); }}
                  disabled={isReEvaluating}
                  className="mt-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-code hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isReEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running Re-Evaluation...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Run Re-Evaluation
                    </>
                  )}
                </button>
              </div>
            )}

            {reEvalError && (
              <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">{reEvalError}</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button onClick={() => onStatusChange("accepted")} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-code hover:bg-emerald-200">
              Accept
            </button>
            <button onClick={() => onStatusChange("reviewing")} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-code hover:bg-blue-200">
              Mark Reviewing
            </button>
            <button onClick={() => onStatusChange("rejected")} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-code hover:bg-red-200">
              Reject
            </button>
          </div>
        </div>
      )}

      {/* AI Thinking Slide-Out Panel */}
      {showThinking && displayAnalysis?.detailedReasoning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowThinking(false)}>
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6" />
                  <div>
                    <h2 className="text-lg font-semibold">AI Thinking Transcript</h2>
                    <p className="text-sm text-white/80 font-code">
                      {displayRun?.modelName} {displayRun?.analystName && `· ${displayRun.analystName}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowThinking(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Overview</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {displayAnalysis.detailedReasoning.overview}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Document Comprehension</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {displayAnalysis.detailedReasoning.documentComprehension}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Scoring Rationale</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(displayAnalysis.detailedReasoning.scoringRationale).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-indigo-600 font-code font-semibold mb-1">{SCORE_LABELS[key] || key}</p>
                      <p className="text-sm text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {displayAnalysis.detailedReasoning.keyInsights?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-900">Key Insights</h3>
                  </div>
                  <ul className="space-y-2">
                    {displayAnalysis.detailedReasoning.keyInsights.map((insight, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700 bg-amber-50 p-3 rounded-lg">
                        <span className="text-amber-500 font-bold">*</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {displayAnalysis.detailedReasoning.concerns?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-gray-900">Concerns & Red Flags</h3>
                  </div>
                  <ul className="space-y-2">
                    {displayAnalysis.detailedReasoning.concerns.map((concern, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700 bg-red-50 p-3 rounded-lg">
                        <span className="text-red-500 font-bold">!</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Final Thoughts</h3>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-l-4 border-purple-500">
                  {displayAnalysis.detailedReasoning.finalThoughts}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
