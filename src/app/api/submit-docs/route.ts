import { NextRequest, NextResponse } from "next/server";
import { getSubmission, updateSubmission } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const submissionId = formData.get("submissionId") as string;

    if (!submissionId) {
      return NextResponse.json(
        { error: "Submission ID required" },
        { status: 400 }
      );
    }

    const submission = getSubmission(submissionId);
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Get all uploaded files
    const docNames: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("doc_") && value instanceof File) {
        // In production, you would upload to S3/CloudStorage
        // For now, just record the file names
        docNames.push(value.name);
        console.log(`[DOCS] Received additional doc: ${value.name}`);
      }
    }

    // Update submission with additional docs
    updateSubmission(submissionId, {
      additionalDocs: [...submission.additionalDocs, ...docNames],
      status: "reviewing",
    });

    console.log(`[DOCS] Updated submission ${submissionId} with ${docNames.length} docs`);

    return NextResponse.json({
      success: true,
      message: "Additional documents received",
      documentCount: docNames.length,
    });
  } catch (error) {
    console.error("Additional docs error:", error);
    return NextResponse.json(
      { error: "Failed to process documents" },
      { status: 500 }
    );
  }
}
