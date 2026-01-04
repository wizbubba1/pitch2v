import { NextRequest, NextResponse } from "next/server";
import { getSubmission } from "@/lib/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get("id");
  const fileType = searchParams.get("type") || "pitch"; // "pitch" or "additional"
  const fileIndex = parseInt(searchParams.get("index") || "0", 10);
  const password = searchParams.get("password");

  // Simple password check
  const adminPassword = process.env.ADMIN_PASSWORD || "vitruvius2025";
  if (password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!submissionId) {
    return NextResponse.json({ error: "Submission ID required" }, { status: 400 });
  }

  const submission = getSubmission(submissionId);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  let file;
  if (fileType === "pitch") {
    file = submission.pitchDeckFile;
  } else if (fileType === "additional") {
    file = submission.additionalDocsFiles?.[fileIndex];
  }

  if (!file || !file.base64) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Decode base64 to buffer
  const buffer = Buffer.from(file.base64, "base64");

  // Determine content type
  const contentType = file.name.endsWith(".pdf")
    ? "application/pdf"
    : "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${file.name}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
