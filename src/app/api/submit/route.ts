import { NextRequest, NextResponse } from "next/server";
import { addSubmission, generateId, Submission } from "@/lib/store";
import { extractText } from "unpdf";

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const result = await extractText(uint8Array);
  const text = Array.isArray(result.text) ? result.text.join("\n") : String(result.text);
  return text;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const contactInfoStr = formData.get("contactInfo") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const contactInfo = JSON.parse(contactInfoStr);
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from PDF for later analysis
    let content = "";
    if (file.name.endsWith(".pdf")) {
      content = await extractTextFromPDF(buffer);
    } else {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 100) {
      return NextResponse.json(
        { error: "Could not extract sufficient content from the document" },
        { status: 400 }
      );
    }

    // Truncate if too long
    if (content.length > 80000) {
      content = content.substring(0, 80000) + "\n\n[Content truncated...]";
    }

    // Store the file as base64
    const base64File = buffer.toString("base64");

    // Create submission WITHOUT running AI analysis
    // Admin will trigger analysis manually from dashboard
    const submissionId = generateId();
    const submission: Submission = {
      id: submissionId,
      createdAt: new Date().toISOString(),
      contactInfo,
      fileName: file.name,
      fileSize: file.size,
      pitchDeckFile: {
        name: file.name,
        size: file.size,
        base64: base64File,
        extractedText: content,
      },
      analyzed: false, // Not yet analyzed - admin will trigger
      analysisRuns: [], // Multiple analysis runs stored here
      additionalDocsFiles: [],
      status: "awaiting-analysis",
      notes: "",
    };

    addSubmission(submission);
    console.log(`[SUBMIT] Stored submission ${submissionId} - awaiting admin analysis`);

    // Return success immediately - no waiting for AI
    return NextResponse.json({
      submissionId,
      message: "Submission received successfully. Our team will review your pitch deck.",
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submission failed" },
      { status: 500 }
    );
  }
}
