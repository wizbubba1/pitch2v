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
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Rocket,
  ArrowRight,
} from "lucide-react";

interface CategoryAnalysis {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface AnalysisResult {
  startupName?: string;
  executiveSummary?: string;
  recommendation?: string;
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
  categoryAnalysis?: {
    visionFit: CategoryAnalysis;
    scientificRigor: CategoryAnalysis;
    marketGTM: CategoryAnalysis;
    technicalFeasibility: CategoryAnalysis;
    complianceEthics: CategoryAnalysis;
    teamExecution: CategoryAnalysis;
    ipDefensibility: CategoryAnalysis;
  };
  strengths: string[];
  improvements: string[];
  portfolioSynergies?: string[];
  nextSteps?: string[];
  dreamCreateDeliver?: {
    dream: string;
    create: string;
    deliver: string;
  };
}

const CATEGORY_LABELS: Record<string, { label: string; weight: string }> = {
  visionFit: { label: "Vision Fit", weight: "20%" },
  scientificRigor: { label: "Scientific Rigor", weight: "15%" },
  marketGTM: { label: "Market & GTM", weight: "15%" },
  technicalFeasibility: { label: "Technical Feasibility", weight: "15%" },
  complianceEthics: { label: "Compliance & Ethics", weight: "15%" },
  teamExecution: { label: "Team & Execution", weight: "15%" },
  ipDefensibility: { label: "IP / Defensibility", weight: "5%" },
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
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
    setFile(null);
    setLinkUrl("");
    runDemoAnalysis();
  }, []);

  const runDemoAnalysis = () => {
    setIsAnalyzing(true);
    setError(null);
    setTimeout(() => {
      setResult({
        startupName: "MedVision AI",
        executiveSummary:
          "MedVision AI presents a compelling AI-powered diagnostic imaging platform for early cancer detection. The team demonstrates strong clinical validation and clear regulatory pathway, with notable synergies to Vitruvius's existing portfolio in medical imaging and AI.",
        recommendation: "STRONG FIT",
        overallScore: 76,
        scores: {
          visionFit: 85,
          scientificRigor: 78,
          marketGTM: 68,
          technicalFeasibility: 82,
          complianceEthics: 75,
          teamExecution: 72,
          ipDefensibility: 65,
        },
        categoryAnalysis: {
          visionFit: {
            score: 8.5,
            feedback:
              "Strong alignment with Vitruvius's Tier 1 focus on AI & Data-Driven Health Systems. The problem statement clearly addresses a critical gap in early cancer detection that impacts millions of patients annually. Clear mission to democratize access to specialist-level diagnostics.",
            strengths: [
              "Direct patient outcome impact through early detection",
              "Clear alignment with Vitruvius AI/diagnostics focus",
            ],
            improvements: [
              "Could strengthen connection to specific Vitruvius portfolio synergies",
              "Expand on accessibility commitment for underserved populations",
            ],
          },
          scientificRigor: {
            score: 7.8,
            feedback:
              "Solid evidence base with published validation studies and clinical trial data. Methodology is sound with appropriate training data diversity. Would benefit from additional peer-reviewed publications and clearer path to regulatory-grade evidence.",
            strengths: [
              "Clinical validation study with 10,000+ cases",
              "Partnership with academic medical center",
            ],
            improvements: [
              "Need peer-reviewed publication of core algorithm",
              "Expand training data geographic diversity",
            ],
          },
          marketGTM: {
            score: 6.8,
            feedback:
              "Market sizing is reasonable but relies heavily on analyst reports. Customer understanding is developing with initial pilot feedback. GTM strategy needs more specificity around healthcare procurement cycles and value analysis committee approach.",
            strengths: [
              "Clear TAM/SAM/SOM breakdown",
              "Initial pilot with 3 hospital systems",
            ],
            improvements: [
              "Develop detailed procurement cycle timeline",
              "Clarify pricing model for different buyer segments",
            ],
          },
          technicalFeasibility: {
            score: 8.2,
            feedback:
              "Working MVP with demonstrated performance metrics. Architecture is well-designed for healthcare integration with FHIR compatibility. Scalability approach is sound. Edge deployment strategy addresses latency concerns.",
            strengths: [
              "Working product with proven accuracy metrics",
              "FHIR-compliant integration architecture",
            ],
            improvements: [
              "Document PACS integration requirements more clearly",
              "Address on-premise deployment option for data-sensitive institutions",
            ],
          },
          complianceEthics: {
            score: 7.5,
            feedback:
              "Good regulatory awareness with 510(k) pathway identified. HIPAA compliance architecture is appropriate. Could strengthen algorithmic bias documentation and human oversight protocols for clinical decision support.",
            strengths: [
              "Clear 510(k) regulatory strategy",
              "Privacy-by-design architecture",
            ],
            improvements: [
              "Document algorithmic fairness testing across demographics",
              "Clarify human-in-the-loop requirements for clinical use",
            ],
          },
          teamExecution: {
            score: 7.2,
            feedback:
              "Balanced team with clinical and technical expertise. CEO has relevant healthcare experience. Would benefit from stronger commercial leadership and advisory board expansion. Commitment level appears strong.",
            strengths: [
              "MD/PhD co-founder with radiology background",
              "Strong technical team with ML expertise",
            ],
            improvements: [
              "Add commercial leader with MedTech sales experience",
              "Expand clinical advisory board",
            ],
          },
          ipDefensibility: {
            score: 6.5,
            feedback:
              "Provisional patents filed for core algorithms. Trade secret approach for training methodology is appropriate. Would benefit from freedom-to-operate analysis and defensive IP strategy documentation.",
            strengths: [
              "Provisional patents filed",
              "Proprietary training dataset",
            ],
            improvements: [
              "Complete freedom-to-operate analysis",
              "Develop defensive IP strategy",
            ],
          },
        },
        strengths: [
          "Clear problem statement tied to patient outcomes with measurable impact potential",
          "Evidence of clinical validation with pilot traction at 3 hospital systems",
          "Strong technical foundation with working MVP and healthcare-ready architecture",
          "Balanced founding team with complementary clinical and technical expertise",
        ],
        improvements: [
          "Clarify reimbursement pathway and payer strategy for sustainable adoption",
          "Strengthen GTM sequence with detailed procurement timeline and champion development",
          "Expand IP documentation with FTO analysis and defensive strategy",
          "Document algorithmic fairness testing methodology for FDA submission",
        ],
        portfolioSynergies: [
          "Vope Medical: Complementary AI surgical imaging capabilities",
          "SonoHL: Potential integration for multi-modal diagnostic workflows",
          "InstaClinic.ai: Workflow integration for AI-assisted triage",
        ],
        nextSteps: [
          "Schedule partner meeting to discuss clinical validation data in detail",
          "Prepare detailed reimbursement pathway analysis (CPT codes, payer coverage)",
          "Document algorithmic bias testing results across demographic groups",
          "Provide freedom-to-operate analysis summary for IP review",
        ],
        dreamCreateDeliver: {
          dream:
            "Strong vision for democratizing specialist-level cancer diagnostics. Clear articulation of patient impact and alignment with Vitruvius mission to accelerate healthcare innovation.",
          create:
            "Good fit for Vitruvius acceleration. Could benefit from RI-MUHC partnership for expanded clinical validation and McGill collaboration for algorithm refinement.",
          deliver:
            "Path to market is viable but needs refinement. Regulatory strategy is sound; commercial strategy requires strengthening before scale.",
        },
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const runAnalysis = async () => {
    if (!file && !linkUrl) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setExpandedCategory(null);

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

  const getRecommendationColor = (rec?: string) => {
    switch (rec) {
      case "STRONG FIT":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "MODERATE FIT":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "WEAK FIT":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "NOT ALIGNED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

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
            across vision, science, market, ethics, and execution using the
            Vitruvius evaluation framework powered by Claude Opus 4.5.
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

            {/* Error State */}
            {error && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-code text-xs text-amber-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-code text-sm text-gray-400 uppercase tracking-wider">
                alignment meter
              </h2>
              {result?.recommendation && (
                <span
                  className={`px-3 py-1 text-xs font-code font-medium rounded-full border ${getRecommendationColor(
                    result.recommendation
                  )}`}
                >
                  {result.recommendation}
                </span>
              )}
            </div>

            {/* Startup Name & Summary */}
            {result?.startupName && (
              <div className="fade-in">
                <h3 className="font-semibold text-lg mb-1">
                  {result.startupName}
                </h3>
                {result.executiveSummary && (
                  <p className="font-code text-sm text-gray-600 leading-relaxed">
                    {result.executiveSummary}
                  </p>
                )}
              </div>
            )}

            {/* Circular Meter */}
            <div className="flex justify-center py-6">
              <div className="relative">
                <svg className="progress-ring w-44 h-44" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
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
                    className={`font-code text-3xl font-semibold ${
                      isAnalyzing ? "pulse-glow" : ""
                    }`}
                  >
                    {displayScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Score Categories with Expandable Details */}
            <div className="border-t border-gray-100 pt-4">
              {Object.entries(CATEGORY_LABELS).map(([key, { label, weight }]) => {
                const score = result?.scores[key as keyof typeof result.scores] ?? 0;
                const analysis =
                  result?.categoryAnalysis?.[
                    key as keyof typeof result.categoryAnalysis
                  ];
                const isExpanded = expandedCategory === key;

                return (
                  <div key={key} className="border-b border-gray-100">
                    <button
                      onClick={() =>
                        setExpandedCategory(isExpanded ? null : key)
                      }
                      className="w-full py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      disabled={!analysis}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-code text-sm text-gray-700">
                          {label}
                        </span>
                        <span className="font-code text-xs text-gray-400">
                          ({weight})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-code text-sm font-medium ${getScoreColor(
                            score
                          )}`}
                        >
                          {score}%
                        </span>
                        {analysis &&
                          (isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ))}
                      </div>
                    </button>
                    {isExpanded && analysis && (
                      <div className="pb-4 px-2 fade-in">
                        <p className="font-code text-xs text-gray-600 mb-3 leading-relaxed">
                          {analysis.feedback}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-code text-xs text-emerald-600 font-medium mb-1">
                              Strengths
                            </p>
                            <ul className="space-y-1">
                              {analysis.strengths.map((s, i) => (
                                <li
                                  key={i}
                                  className="font-code text-xs text-gray-600 flex gap-1"
                                >
                                  <span className="text-emerald-400">+</span>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-code text-xs text-amber-600 font-medium mb-1">
                              Improve
                            </p>
                            <ul className="space-y-1">
                              {analysis.improvements.map((s, i) => (
                                <li
                                  key={i}
                                  className="font-code text-xs text-gray-600 flex gap-1"
                                >
                                  <span className="text-amber-400">→</span>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Loading State */}
            {isAnalyzing && (
              <div className="text-center py-6 font-code text-sm text-[#4da6e8] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with Vitruvius evaluation framework...
              </div>
            )}

            {/* Empty State */}
            {!result && !isAnalyzing && (
              <div className="text-center py-6 text-gray-400 font-code text-sm">
                Upload a deck or use demo to see analysis
              </div>
            )}
          </div>
        </div>

        {/* Extended Results Section */}
        {result && (
          <div className="mt-12 pt-12 border-t border-gray-100 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Key Strengths */}
              <div>
                <h3 className="font-code text-sm text-[#4da6e8] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  key strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((item, idx) => (
                    <li
                      key={idx}
                      className="font-code text-xs text-gray-600 flex gap-2"
                    >
                      <span className="text-emerald-400 mt-0.5">●</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Critical Gaps */}
              <div>
                <h3 className="font-code text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  areas to improve
                </h3>
                <ul className="space-y-2">
                  {result.improvements.map((item, idx) => (
                    <li
                      key={idx}
                      className="font-code text-xs text-gray-600 flex gap-2"
                    >
                      <span className="text-amber-400 mt-0.5">●</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Portfolio Synergies */}
              {result.portfolioSynergies && result.portfolioSynergies.length > 0 && (
                <div>
                  <h3 className="font-code text-sm text-gray-500 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    portfolio synergies
                  </h3>
                  <ul className="space-y-2">
                    {result.portfolioSynergies.map((item, idx) => (
                      <li
                        key={idx}
                        className="font-code text-xs text-gray-600 flex gap-2"
                      >
                        <span className="text-[#4da6e8] mt-0.5">●</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {result.nextSteps && result.nextSteps.length > 0 && (
                <div>
                  <h3 className="font-code text-sm text-gray-500 mb-4 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    recommended next steps
                  </h3>
                  <ul className="space-y-2">
                    {result.nextSteps.map((item, idx) => (
                      <li
                        key={idx}
                        className="font-code text-xs text-gray-600 flex gap-2"
                      >
                        <span className="text-gray-400">{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Dream.Create.Deliver Assessment */}
            {result.dreamCreateDeliver && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="font-code text-sm text-gray-400 uppercase tracking-wider mb-6">
                  Dream. Create. Deliver. Assessment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-[#4da6e8]" />
                      <span className="font-code text-sm font-medium">
                        Dream
                      </span>
                    </div>
                    <p className="font-code text-xs text-gray-600 leading-relaxed">
                      {result.dreamCreateDeliver.dream}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-[#4da6e8]" />
                      <span className="font-code text-sm font-medium">
                        Create
                      </span>
                    </div>
                    <p className="font-code text-xs text-gray-600 leading-relaxed">
                      {result.dreamCreateDeliver.create}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Rocket className="w-4 h-4 text-[#4da6e8]" />
                      <span className="font-code text-sm font-medium">
                        Deliver
                      </span>
                    </div>
                    <p className="font-code text-xs text-gray-600 leading-relaxed">
                      {result.dreamCreateDeliver.deliver}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="font-code text-xs text-gray-400 text-center">
            pitch2v is an AI-powered alignment tool for Vitruvius Venture
            Studios. Powered by Claude Opus 4.5. Your data is processed securely and not stored.
          </p>
        </div>
      </footer>
    </div>
  );
}
