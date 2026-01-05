import { NextRequest, NextResponse } from "next/server";
import {
  getSubmission,
  updateAnalysisRun,
  deleteAnalysisRun,
  setPrimaryRun,
  getAllAnalysisRuns,
} from "@/lib/store";

// GET - List all analysis runs (for history view)
export async function GET(request: NextRequest) {
  // Check admin password
  const authHeader = request.headers.get("Authorization");
  const password = authHeader?.replace("Bearer ", "");
  const adminPassword = process.env.ADMIN_PASSWORD || "vitruvius2025";

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get("submissionId");

  // If submissionId provided, get runs for that submission only
  if (submissionId) {
    const submission = getSubmission(submissionId);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json({
      runs: submission.analysisRuns,
      primaryRunId: submission.primaryRunId,
    });
  }

  // Otherwise return all runs across all submissions
  const allRuns = getAllAnalysisRuns();

  return NextResponse.json({
    runs: allRuns.map(({ submission, run }) => ({
      ...run,
      submissionId: submission.id,
      companyName: submission.contactInfo.companyName,
      startupName: run.analysis.startupName || submission.contactInfo.companyName,
      submissionStatus: submission.status,
      isPrimary: submission.primaryRunId === run.id,
    })),
  });
}

// PATCH - Update a run (toggle keep, set primary)
export async function PATCH(request: NextRequest) {
  // Check admin password
  const authHeader = request.headers.get("Authorization");
  const password = authHeader?.replace("Bearer ", "");
  const adminPassword = process.env.ADMIN_PASSWORD || "vitruvius2025";

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { submissionId, runId, action, isKept } = body;

    if (!submissionId || !runId) {
      return NextResponse.json(
        { error: "submissionId and runId are required" },
        { status: 400 }
      );
    }

    const submission = getSubmission(submissionId);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const run = submission.analysisRuns.find((r) => r.id === runId);
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    if (action === "setPrimary") {
      const success = setPrimaryRun(submissionId, runId);
      if (!success) {
        return NextResponse.json({ error: "Failed to set primary run" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Primary run updated" });
    }

    if (action === "toggleKeep" || isKept !== undefined) {
      const newIsKept = isKept !== undefined ? isKept : !run.isKept;
      const success = updateAnalysisRun(submissionId, runId, { isKept: newIsKept });
      if (!success) {
        return NextResponse.json({ error: "Failed to update run" }, { status: 500 });
      }
      return NextResponse.json({ success: true, isKept: newIsKept });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Run update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a run
export async function DELETE(request: NextRequest) {
  // Check admin password
  const authHeader = request.headers.get("Authorization");
  const password = authHeader?.replace("Bearer ", "");
  const adminPassword = process.env.ADMIN_PASSWORD || "vitruvius2025";

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("submissionId");
    const runId = searchParams.get("runId");

    if (!submissionId || !runId) {
      return NextResponse.json(
        { error: "submissionId and runId are required" },
        { status: 400 }
      );
    }

    const success = deleteAnalysisRun(submissionId, runId);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete run" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Run deleted" });
  } catch (error) {
    console.error("Run delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}
