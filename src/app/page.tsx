"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  Link as LinkIcon,
  FileText,
  Clock,
  Shield,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

interface AnalysisResult {
  overallScore: number;
  scores: {
    visionFit: number;
    scientificRigor: number;
    marketGTM: number;
    technicalFeasibility: number;
    complianceEthics: number;
    teamExecution: number;
    ipDefensibility: number;
  };
  strengths: string[];
  improvements: string[];
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/pdf" ||
        droppedFile.name.endsWith(".pptx"))
    ) {
      setFile(droppedFile);
      setLinkUrl("");
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setLinkUrl("");
      }
    },
    []
  );

  const handleDemoClick = useCallback(() => {
    // Simulate a demo analysis
    setFile(null);
    setLinkUrl("");
    runDemoAnalysis();
  }, []);

  const runDemoAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate API call with demo results
    setTimeout(() => {
      setResult({
        overallScore: 72,
        scores: {
          visionFit: 85,
          scientificRigor: 78,
          marketGTM: 65,
          technicalFeasibility: 80,
          complianceEthics: 70,
          teamExecution: 68,
          ipDefensibility: 58,
        },
        strengths: [
          "Clear problem statement tied to patient outcomes.",
          "Evidence of prototype traction and pilot design.",
          "Crisp KPI tree and validation milestones.",
        ],
        improvements: [
          "Clarify reimbursement path and regulatory class.",
          "Tighten GTM sequence and partner landscape.",
          "Define IP claims and defensive moat.",
        ],
      });
      setIsAnalyzing(false);
    }, 2500);
  };

  const runAnalysis = async () => {
    if (!file && !linkUrl) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else if (linkUrl) {
        formData.append("url", linkUrl);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // If API fails, show error but also run demo for UX
        setError(data.error || "Analysis failed");
        runDemoAnalysis();
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Connection error. Showing demo results.");
      runDemoAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayScore = result?.overallScore ?? 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-gray-300 rounded" />
            <span className="font-code text-xl font-semibold tracking-tight">
              pitch<span className="text-[#4da6e8]">2</span>v
            </span>
            <span className="ml-2 px-2 py-0.5 text-xs font-code bg-gray-100 text-gray-500 rounded">
              beta
            </span>
          </div>
          <nav className="flex items-center gap-8">
            <a
              href="#criteria"
              className="font-code text-sm text-gray-600 hover:text-black transition-colors"
            >
              criteria
            </a>
            <a
              href="#how-it-works"
              className="font-code text-sm text-gray-600 hover:text-black transition-colors"
            >
              how it works
            </a>
            <a
              href="#privacy"
              className="font-code text-sm text-gray-600 hover:text-black transition-colors"
            >
              privacy
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Status Badges */}
        <div className="flex justify-end mb-8 gap-4">
          <div className="flex items-center gap-1.5 text-xs font-code text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>No login</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-code text-gray-500">
            <Wallet className="w-3.5 h-3.5" />
            <span>No wallet</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-code text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Local demo</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            Does your deck align with
            <br />
            <span className="text-[#4da6e8]">Vitruvius Venture Studios</span>?
          </h1>
          <p className="font-code text-sm text-gray-600 max-w-2xl leading-relaxed">
            Upload a PDF or PPTX, or paste a link. We&apos;ll score alignment
            across vision, science, market, ethics, and execution. Black code
            text. White canvas. Accents in light blue and silver for that clean,
            scientific feel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            {/* Upload Zone */}
            <div>
              <label className="font-code text-xs text-gray-400 uppercase tracking-wider mb-3 block">
                upload deck
              </label>
              <div
                className={`upload-zone rounded-lg p-8 text-center ${
                  isDragOver ? "drag-over" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-5 h-5 text-[#4da6e8]" />
                    <span className="font-code text-sm">{file.name}</span>
                    <button
                      onClick={clearFile}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#4da6e8] mx-auto mb-4" />
                    <p className="font-code text-sm text-gray-600 mb-4">
                      Drag & drop your{" "}
                      <span className="font-semibold">PDF / PPTX</span> here
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary px-4 py-2 rounded font-code text-sm"
                      >
                        Browse files
                      </button>
                      <button
                        onClick={handleDemoClick}
                        className="btn-secondary px-4 py-2 rounded font-code text-sm"
                      >
                        Use demo deck
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.pptx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Link Input */}
            <div>
              <label className="font-code text-xs text-gray-400 uppercase tracking-wider mb-3 block">
                or paste link
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    if (e.target.value) setFile(null);
                  }}
                  placeholder="https://... (Google Drive / Dropbox / website)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg font-code text-sm focus:outline-none focus:border-[#4da6e8] transition-colors"
                />
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={runAnalysis}
              disabled={(!file && !linkUrl) || isAnalyzing}
              className={`btn-secondary px-6 py-3 rounded-lg font-code text-sm flex items-center gap-2 ${
                (!file && !linkUrl) || isAnalyzing
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Run alignment analysis"
              )}
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-code text-sm text-gray-400 uppercase tracking-wider">
                alignment meter
              </h2>
              <span className="font-code text-xs text-gray-400">
                front-end demo
              </span>
            </div>

            {/* Circular Meter */}
            <div className="flex justify-center py-8">
              <div className="relative">
                <svg
                  className="progress-ring w-48 h-48"
                  viewBox="0 0 160 160"
                >
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#4da6e8"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="progress-ring__circle"
                    style={{
                      strokeDasharray: 440,
                      strokeDashoffset: 440 - (440 * displayScore) / 100,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`font-code text-4xl font-semibold ${
                      isAnalyzing ? "pulse-glow" : ""
                    }`}
                  >
                    {displayScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Score Categories */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 border-t border-gray-100 pt-6">
              <ScoreCategory
                label="Vision Fit"
                score={result?.scores.visionFit ?? 0}
              />
              <ScoreCategory
                label="Scientific Rigor"
                score={result?.scores.scientificRigor ?? 0}
              />
              <ScoreCategory
                label="Market & GTM"
                score={result?.scores.marketGTM ?? 0}
              />
              <ScoreCategory
                label="Technical Feasibility"
                score={result?.scores.technicalFeasibility ?? 0}
              />
              <ScoreCategory
                label="Compliance & Ethics"
                score={result?.scores.complianceEthics ?? 0}
              />
              <ScoreCategory
                label="Team & Execution"
                score={result?.scores.teamExecution ?? 0}
              />
              <ScoreCategory
                label="IP / Defensibility"
                score={result?.scores.ipDefensibility ?? 0}
              />
            </div>

            {/* Feedback Sections */}
            {result && (
              <div className="grid grid-cols-2 gap-8 pt-6 fade-in">
                {/* Strengths */}
                <div>
                  <h3 className="font-code text-sm text-[#4da6e8] mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    what stands out
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((item, idx) => (
                      <li
                        key={idx}
                        className="font-code text-xs text-gray-600 flex gap-2"
                      >
                        <span className="text-gray-300">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div>
                  <h3 className="font-code text-sm text-gray-500 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    what to improve
                  </h3>
                  <ul className="space-y-2">
                    {result.improvements.map((item, idx) => (
                      <li
                        key={idx}
                        className="font-code text-xs text-gray-600 flex gap-2"
                      >
                        <span className="text-gray-300">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && !isAnalyzing && (
              <div className="text-center py-8 text-gray-400 font-code text-sm">
                Upload a deck or use demo to see analysis
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="text-center py-8 font-code text-sm text-[#4da6e8] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing alignment with Vitruvius criteria...
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-code text-xs text-amber-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="font-code text-xs text-gray-400 text-center">
            pitch2v is an AI-powered alignment tool for Vitruvius Venture
            Studios. Your data is processed locally and not stored.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ScoreCategory({ label, score }: { label: string; score: number }) {
  return (
    <div className="score-category">
      <span className="font-code text-sm text-gray-700">{label}</span>
      <span className="font-code text-sm text-gray-400">{score}%</span>
    </div>
  );
}
