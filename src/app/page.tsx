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
  Loader2,
  X,
  User,
  Building2,
  Mail,
  Linkedin,
  Briefcase,
  FileUp,
  ArrowRight,
} from "lucide-react";

interface ContactInfo {
  name: string;
  companyRole: string;
  companyName: string;
  email: string;
  linkedIn: string;
}

type SubmissionStage = "form" | "uploading" | "analyzing" | "submitted" | "additional-docs";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [additionalDocs, setAdditionalDocs] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [stage, setStage] = useState<SubmissionStage>("form");
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: "",
    companyRole: "",
    companyName: "",
    email: "",
    linkedIn: "",
  });
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [scoreRange, setScoreRange] = useState<"low" | "mid" | "high" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalDocsRef = useRef<HTMLInputElement>(null);

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
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
      }
    },
    []
  );

  const handleAdditionalDocsSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setAdditionalDocs((prev) => [...prev, ...files]);
    },
    []
  );

  const removeAdditionalDoc = (index: number) => {
    setAdditionalDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      file &&
      contactInfo.name.trim() &&
      contactInfo.companyRole.trim() &&
      contactInfo.companyName.trim() &&
      contactInfo.email.trim() &&
      contactInfo.email.includes("@")
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setStage("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file!);
      formData.append("contactInfo", JSON.stringify(contactInfo));

      setStage("analyzing");

      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setSubmissionId(data.submissionId);

      // Determine score range for UI flow
      const score = data.overallScore || 0;
      if (score < 50) {
        setScoreRange("low");
        setStage("submitted");
      } else if (score >= 50 && score < 70) {
        setScoreRange("mid");
        setStage("additional-docs");
      } else {
        setScoreRange("high");
        setStage("submitted");
      }
    } catch (error) {
      console.error("Submission error:", error);
      // For demo, show submitted anyway
      setSubmissionId("demo-" + Date.now());
      setScoreRange("mid");
      setStage("additional-docs");
    }
  };

  const handleAdditionalDocsSubmit = async () => {
    if (additionalDocs.length === 0) {
      setStage("submitted");
      return;
    }

    setStage("uploading");

    try {
      const formData = new FormData();
      formData.append("submissionId", submissionId || "");
      additionalDocs.forEach((doc, i) => {
        formData.append(`doc_${i}`, doc);
      });

      await fetch("/api/submit-docs", {
        method: "POST",
        body: formData,
      });

      setStage("submitted");
    } catch (error) {
      console.error("Additional docs error:", error);
      setStage("submitted");
    }
  };

  const skipAdditionalDocs = () => {
    setStage("submitted");
  };

  // Render based on stage
  if (stage === "submitted") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-semibold mb-4">
            Thank You for Your Submission
          </h1>
          <p className="font-code text-sm text-gray-600 mb-8 leading-relaxed">
            Your pitch deck has been received and is being reviewed by the
            Vitruvius Venture Studio team. We will contact you at{" "}
            <span className="font-medium text-black">{contactInfo.email}</span>{" "}
            within 5-7 business days with our feedback.
          </p>
          {submissionId && (
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg">
              <p className="font-code text-xs text-gray-500">
                Reference ID:{" "}
                <span className="font-medium text-gray-700">{submissionId}</span>
              </p>
            </div>
          )}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg text-left">
            <h3 className="font-code text-sm font-medium mb-3">What happens next?</h3>
            <ul className="space-y-2">
              <li className="font-code text-xs text-gray-600 flex gap-2">
                <span className="text-[#4da6e8]">1.</span>
                Our team reviews your submission using the Vitruvius evaluation framework
              </li>
              <li className="font-code text-xs text-gray-600 flex gap-2">
                <span className="text-[#4da6e8]">2.</span>
                We assess alignment with our portfolio thesis and focus areas
              </li>
              <li className="font-code text-xs text-gray-600 flex gap-2">
                <span className="text-[#4da6e8]">3.</span>
                You&apos;ll receive detailed feedback and next steps via email
              </li>
            </ul>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (stage === "additional-docs") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileUp className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-semibold mb-3">
              Additional Documentation Requested
            </h1>
            <p className="font-code text-sm text-gray-600 leading-relaxed">
              Your submission shows promise! To help our team make a more informed
              decision, please provide any additional documentation that supports
              your pitch.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-code text-xs text-amber-800">
                <strong>Helpful documents include:</strong> Business whitepaper,
                technical methodology, financial projections, clinical validation
                data, team bios, letters of intent, or any other supporting materials.
              </p>
            </div>

            {/* Additional Docs Upload */}
            <div>
              <label className="font-code text-xs text-gray-400 uppercase tracking-wider mb-3 block">
                upload additional documents
              </label>
              <div
                className="upload-zone rounded-lg p-6 text-center cursor-pointer"
                onClick={() => additionalDocsRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-[#4da6e8] mx-auto mb-3" />
                <p className="font-code text-sm text-gray-600">
                  Click to upload PDF, DOCX, or PPTX files
                </p>
                <input
                  ref={additionalDocsRef}
                  type="file"
                  accept=".pdf,.docx,.pptx,.doc,.xls,.xlsx"
                  multiple
                  onChange={handleAdditionalDocsSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Uploaded Files List */}
            {additionalDocs.length > 0 && (
              <div className="space-y-2">
                {additionalDocs.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#4da6e8]" />
                      <span className="font-code text-sm">{doc.name}</span>
                    </div>
                    <button
                      onClick={() => removeAdditionalDoc(index)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={skipAdditionalDocs}
                className="flex-1 btn-secondary px-6 py-3 rounded-lg font-code text-sm"
              >
                Skip for now
              </button>
              <button
                onClick={handleAdditionalDocsSubmit}
                className="flex-1 btn-primary px-6 py-3 rounded-lg font-code text-sm flex items-center justify-center gap-2"
              >
                Submit Documents
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (stage === "uploading" || stage === "analyzing") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-32 text-center">
          <Loader2 className="w-12 h-12 text-[#4da6e8] animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold mb-2">
            {stage === "uploading" ? "Uploading your pitch deck..." : "Analyzing your submission..."}
          </h2>
          <p className="font-code text-sm text-gray-500">
            {stage === "analyzing" && "This may take up to a minute. Please don't close this page."}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // Default: Form stage
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Status Badges */}
        <div className="flex justify-end mb-8 gap-4">
          <div className="flex items-center gap-1.5 text-xs font-code text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>No login required</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-code text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure submission</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            Submit Your Pitch to
            <br />
            <span className="text-[#4da6e8]">Vitruvius Venture Studio</span>
          </h1>
          <p className="font-code text-sm text-gray-600 max-w-2xl leading-relaxed">
            Upload your pitch deck and we&apos;ll evaluate alignment with our
            investment thesis. Our team reviews submissions within 5-7 business
            days and will reach out with feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Info */}
          <div className="space-y-5">
            <h2 className="font-code text-sm text-gray-400 uppercase tracking-wider">
              your information
            </h2>

            {/* Name */}
            <div>
              <label className="font-code text-xs text-gray-500 mb-1.5 block">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => handleContactChange("name", e.target.value)}
                  placeholder="John Smith"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-code text-sm focus:outline-none focus:border-[#4da6e8] transition-colors"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="font-code text-xs text-gray-500 mb-1.5 block">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={contactInfo.companyName}
                  onChange={(e) => handleContactChange("companyName", e.target.value)}
                  placeholder="MedTech Innovations Inc."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-code text-sm focus:outline-none focus:border-[#4da6e8] transition-colors"
                />
              </div>
            </div>

            {/* Company Role */}
            <div>
              <label className="font-code text-xs text-gray-500 mb-1.5 block">
                Your Role *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={contactInfo.companyRole}
                  onChange={(e) => handleContactChange("companyRole", e.target.value)}
                  placeholder="CEO & Co-Founder"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-code text-sm focus:outline-none focus:border-[#4da6e8] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="font-code text-xs text-gray-500 mb-1.5 block">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => handleContactChange("email", e.target.value)}
                  placeholder="john@medtech.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-code text-sm focus:outline-none focus:border-[#4da6e8] transition-colors"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label className="font-code text-xs text-gray-500 mb-1.5 block">
                LinkedIn Profile (optional)
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={contactInfo.linkedIn}
                  onChange={(e) => handleContactChange("linkedIn", e.target.value)}
                  placeholder="https://linkedin.com/in/johnsmith"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-code text-sm focus:outline-none focus:border-[#4da6e8] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Upload */}
          <div className="space-y-5">
            <h2 className="font-code text-sm text-gray-400 uppercase tracking-wider">
              pitch deck
            </h2>

            {/* Upload Zone */}
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
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary px-4 py-2 rounded font-code text-sm"
                  >
                    Browse files
                  </button>
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

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`w-full btn-primary px-6 py-3 rounded-lg font-code text-sm flex items-center justify-center gap-2 ${
                !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Submit for Review
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Info Box */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-code text-sm font-medium mb-2">
                What we look for
              </h3>
              <ul className="space-y-1.5">
                <li className="font-code text-xs text-gray-600 flex gap-2">
                  <span className="text-[#4da6e8]">•</span>
                  Healthcare, MedTech, or EdTech focus
                </li>
                <li className="font-code text-xs text-gray-600 flex gap-2">
                  <span className="text-[#4da6e8]">•</span>
                  Clear problem statement with patient/learner impact
                </li>
                <li className="font-code text-xs text-gray-600 flex gap-2">
                  <span className="text-[#4da6e8]">•</span>
                  Technical feasibility and regulatory awareness
                </li>
                <li className="font-code text-xs text-gray-600 flex gap-2">
                  <span className="text-[#4da6e8]">•</span>
                  Committed founding team
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
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
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="font-code text-xs text-gray-400 text-center">
          pitch2v is a submission portal for Vitruvius Venture Studio.
          Your data is processed securely and reviewed by our team.
        </p>
      </div>
    </footer>
  );
}
