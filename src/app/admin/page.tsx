"use client";

import { useState } from "react";
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
} from "lucide-react";

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
}

interface StoredFile {
  name: string;
  size: number;
  base64: string;
  extractedText: string;
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
  analysis: AnalysisResult;
  additionalDocsFiles?: StoredFile[];
  reEvaluation?: {
    analysis: AnalysisResult;
    evaluatedAt: string;
    combinedDocuments: string[];
  };
  status: string;
  notes: string;
}

interface Stats {
  total: number;
  highScore: number;
  midScore: number;
  lowScore: number;
  pending: number;
  reviewing: number;
  accepted: number;
  rejected: number;
}

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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "high" | "mid" | "low">("all");

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
    if (filter === "high") return s.analysis.overallScore >= 70;
    if (filter === "mid") return s.analysis.overallScore >= 50 && s.analysis.overallScore < 70;
    if (filter === "low") return s.analysis.overallScore < 50;
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
      default:
        return "bg-gray-100 text-gray-800";
    }
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
          <button
            onClick={fetchSubmissions}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Total Submissions"
              value={stats.total}
              color="text-gray-600"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              label="High Score (70+)"
              value={stats.highScore}
              color="text-emerald-600"
            />
            <StatCard
              icon={<AlertCircle className="w-5 h-5" />}
              label="Mid Score (50-70)"
              value={stats.midScore}
              color="text-amber-600"
            />
            <StatCard
              icon={<XCircle className="w-5 h-5" />}
              label="Low Score (<50)"
              value={stats.lowScore}
              color="text-red-600"
            />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "high", "mid", "low"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-code text-sm transition-colors ${
                filter === f
                  ? "bg-[#4da6e8] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f === "all" && "All"}
              {f === "high" && "70+ (Priority)"}
              {f === "mid" && "50-70 (Review)"}
              {f === "low" && "<50 (Auto-reject)"}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-code">No submissions yet</p>
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
              />
            ))
          )}
        </div>
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

function SubmissionCard({
  submission,
  isExpanded,
  onToggle,
  onStatusChange,
  getScoreColor,
  getStatusBadge,
  password,
}: {
  submission: Submission;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => void;
  getScoreColor: (score: number) => string;
  getStatusBadge: (status: string) => string;
  password: string;
}) {
  const initialScore = submission.analysis.overallScore;
  const hasReEval = !!submission.reEvaluation;
  const currentScore = hasReEval ? submission.reEvaluation!.analysis.overallScore : initialScore;
  const scoreChange = hasReEval ? currentScore - initialScore : 0;

  const getDownloadUrl = (type: "pitch" | "additional", index = 0) => {
    return `/api/admin/download?id=${submission.id}&type=${type}&index=${index}&password=${encodeURIComponent(password)}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`w-14 h-14 rounded-lg flex items-center justify-center font-semibold text-lg ${getScoreColor(
                currentScore
              )}`}
            >
              {currentScore}%
            </div>
            {hasReEval && (
              <div
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  scoreChange > 0
                    ? "bg-emerald-500 text-white"
                    : scoreChange < 0
                    ? "bg-red-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
                title={`Score change: ${scoreChange > 0 ? "+" : ""}${scoreChange}`}
              >
                {scoreChange > 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : scoreChange < 0 ? (
                  <ArrowDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {submission.analysis.startupName || submission.contactInfo.companyName}
              {hasReEval && (
                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded font-code">
                  Re-evaluated
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 font-code">
              {submission.contactInfo.name} · {submission.contactInfo.companyRole}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-code ${getStatusBadge(
              submission.status
            )}`}
          >
            {submission.status}
          </span>
          <span className="text-xs text-gray-400 font-code">
            {new Date(submission.createdAt).toLocaleDateString()}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-6">
          {/* Contact Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 font-code mb-1">Email</p>
              <a
                href={`mailto:${submission.contactInfo.email}`}
                className="text-sm text-[#4da6e8] flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                {submission.contactInfo.email}
              </a>
            </div>
            {submission.contactInfo.linkedIn && (
              <div>
                <p className="text-xs text-gray-400 font-code mb-1">LinkedIn</p>
                <a
                  href={submission.contactInfo.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#4da6e8] flex items-center gap-1"
                >
                  <Linkedin className="w-3 h-3" />
                  Profile
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 font-code mb-1">Pitch Deck</p>
              <a
                href={getDownloadUrl("pitch")}
                className="text-sm text-[#4da6e8] flex items-center gap-1 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-3 h-3" />
                {submission.fileName}
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-code mb-1">Recommendation</p>
              <p className="text-sm font-medium">
                {hasReEval
                  ? submission.reEvaluation!.analysis.recommendation
                  : submission.analysis.recommendation || "N/A"}
              </p>
            </div>
          </div>

          {/* Re-evaluation Score Comparison */}
          {hasReEval && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-semibold text-purple-800">Re-Evaluation Results</p>
                <span className="text-xs text-purple-600 font-code">
                  {new Date(submission.reEvaluation!.evaluatedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-6 mb-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-code">Initial</p>
                  <p className={`text-2xl font-bold ${initialScore >= 70 ? "text-emerald-600" : initialScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
                    {initialScore}%
                  </p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-code">After Docs</p>
                  <p className={`text-2xl font-bold ${currentScore >= 70 ? "text-emerald-600" : currentScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
                    {currentScore}%
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  scoreChange > 0 ? "bg-emerald-100 text-emerald-700" :
                  scoreChange < 0 ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {scoreChange > 0 ? "+" : ""}{scoreChange} pts
                </div>
              </div>
              {submission.reEvaluation!.analysis.reEvaluationNotes && (
                <p className="text-sm text-purple-700 bg-white p-2 rounded">
                  <strong>Notes:</strong> {submission.reEvaluation!.analysis.reEvaluationNotes}
                </p>
              )}
            </div>
          )}

          {/* Executive Summary */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-code mb-2">
              Executive Summary {hasReEval && "(Updated)"}
            </p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {hasReEval
                ? submission.reEvaluation!.analysis.executiveSummary
                : submission.analysis.executiveSummary || "N/A"}
            </p>
          </div>

          {/* Scores Grid - Show current (re-evaluated if available) */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-code mb-3">
              Category Scores {hasReEval && "(Re-evaluated)"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(
                hasReEval ? submission.reEvaluation!.analysis.scores : submission.analysis.scores
              ).map(([key, value]) => {
                const initialValue = submission.analysis.scores[key];
                const diff = hasReEval ? value - initialValue : 0;
                return (
                  <div key={key} className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 font-code truncate">
                      {SCORE_LABELS[key] || key}
                    </p>
                    <div className="flex items-center gap-1">
                      <p className={`text-lg font-semibold ${value >= 70 ? "text-emerald-600" : value >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {value}%
                      </p>
                      {hasReEval && diff !== 0 && (
                        <span className={`text-xs ${diff > 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {diff > 0 ? "+" : ""}{diff}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs text-gray-400 font-code mb-2">Key Strengths</p>
              <ul className="space-y-1">
                {(hasReEval ? submission.reEvaluation!.analysis.strengths : submission.analysis.strengths)?.map((s, i) => (
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
                {(hasReEval ? submission.reEvaluation!.analysis.improvements : submission.analysis.improvements)?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-amber-500">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Additional Documents with Downloads */}
          {submission.additionalDocsFiles && submission.additionalDocsFiles.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-gray-400 font-code mb-2">
                Additional Documents ({submission.additionalDocsFiles.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {submission.additionalDocsFiles.map((doc, i) => (
                  <a
                    key={i}
                    href={getDownloadUrl("additional", i)}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-code flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    {doc.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => onStatusChange("accepted")}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-code hover:bg-emerald-200"
            >
              Accept
            </button>
            <button
              onClick={() => onStatusChange("reviewing")}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-code hover:bg-blue-200"
            >
              Mark Reviewing
            </button>
            <button
              onClick={() => onStatusChange("rejected")}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-code hover:bg-red-200"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
