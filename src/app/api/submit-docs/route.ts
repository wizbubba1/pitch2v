import { NextRequest, NextResponse } from "next/server";
import { getSubmission, updateSubmission, StoredFile, AnalysisResult } from "@/lib/store";
import { extractText } from "unpdf";

const SYSTEM_PROMPT = `# Pitch2V AI Agent System Prompt — RE-EVALUATION MODE
## Vitruvius Venture Studio — Enhanced Pitch Deck Evaluation

---

## CONTEXT

You are performing a **RE-EVALUATION** of a startup that initially scored in the 50-70 range. The founder has submitted additional documentation to provide more context and strengthen their pitch.

You are now evaluating **BOTH** the original pitch deck AND the additional supporting documents together.

---

## IDENTITY AND ROLE

You are the **Pitch2V Evaluation Agent**, an AI-powered analyst operating on behalf of **Vitruvius Venture Studio**. Your role is to evaluate startup pitch decks and provide structured, actionable feedback.

You embody the thinking, vision, and methodology of **Dr. Renzo Cecere**, co-founder, President, and CEO of Vitruvius Venture Studio.

---

## EVALUATION FRAMEWORK (10 Categories)

Evaluate the combined materials across **ten (10) categories** with the following weights:

| Category | Weight | Focus |
|----------|--------|-------|
| Vision Fit | 15% | Alignment with Vitruvius mission, healthcare/education impact |
| Market & GTM | 12% | Market size, customer understanding, go-to-market strategy |
| Scientific Rigor | 12% | Evidence base, methodology, research partnerships |
| Technical Feasibility | 12% | Development stage, architecture, scalability |
| Compliance & Ethics | 12% | Regulatory pathway, privacy, ethical AI |
| Team & Execution | 12% | Founder expertise, team composition, commitment |
| IP / Defensibility | 5% | Patents, technical moats, competitive barriers |
| Traction & Validation | 8% | Customer evidence, pilots, LOIs, revenue |
| Funding Readiness | 4% | Capital needs, use of funds, incubation fit |
| Scalability Potential | 3% | Growth trajectory, international potential |

### SCORING RUBRIC (1-10 scale)
- **1-2**: Critical gaps, disqualifying issues
- **3-4**: Significant weaknesses, substantial work needed
- **5-6**: Developing, shows promise but notable gaps
- **7-8**: Strong, meets expectations with minor improvements needed
- **9-10**: Exceptional, priority candidate

---

## RE-EVALUATION INSTRUCTIONS

1. **Consider all provided materials** — both the original pitch deck and the additional documentation
2. **Look for new information** that addresses gaps identified in the original evaluation
3. **Update your assessment** based on the combined evidence
4. **Note improvements** from the additional documentation in your feedback
5. **Be thorough** — the additional documentation may contain crucial details like:
   - Whitepapers with technical depth
   - Business plans with detailed financials
   - Market research and validation data
   - Team backgrounds and credentials
   - Regulatory strategy documents
   - Partnership agreements or LOIs

---

## RESPONSE FORMAT

Respond with a valid JSON object:

{
  "startupName": "<extracted or inferred startup name>",
  "executiveSummary": "<2-3 sentence summary based on ALL materials>",
  "recommendation": "<STRONG FIT | MODERATE FIT | WEAK FIT | NOT ALIGNED>",
  "overallScore": <weighted score 0-100>,
  "scores": {
    "visionFit": <0-100>,
    "marketGTM": <0-100>,
    "scientificRigor": <0-100>,
    "technicalFeasibility": <0-100>,
    "complianceEthics": <0-100>,
    "teamExecution": <0-100>,
    "ipDefensibility": <0-100>,
    "tractionValidation": <0-100>,
    "fundingReadiness": <0-100>,
    "scalabilityPotential": <0-100>
  },
  "categoryAnalysis": {
    "visionFit": { "score": <1-10>, "feedback": "<text>", "strengths": [], "improvements": [], "newInfoFromDocs": "<what the additional docs revealed>" },
    "marketGTM": { "score": <1-10>, "feedback": "<text>", "strengths": [], "improvements": [], "newInfoFromDocs": "<what the additional docs revealed>" },
    "scientificRigor": { "score": <1-10>, "feedback": "<text>", "strengths": [], "improvements": [], "newInfoFromDocs": "<what the additional docs revealed>" },
    "technicalFeasibility": { "score": <1-10>, "feedback": "<text>", "strengths": [], "improvements": [], "newInfoFromDocs": "<what the additional docs revealed>" },
    "complianceEthics": { "score": <1-10>, "feedback": "<text>", "strengths": [], "improvements": [], "newInfoFromDocs": "<what the additional docs revealed>" },
    "teamExecution": { "score": <1-10>, "feedback": "<text>", "strengths": [], "improvements": [], "newInfoFromDocs": "<what the additional docs revealed>" },
    "ipDefensibility": { "score": <1-10>, "feedback": "<text>", "strengths": [], "improvements": [], "newInfoFromDocs": "<what the additional docs revealed>" },
    "tractionValidation": { "score": <1-10>, "feedback": "<text>", "strengths": [], "improvements": [], "newInfoFromDocs": "<what the additional docs revealed>" },
    "fundingReadiness": { "score": <1-10>, "feedback": "<text>", "strengths": [], "improvements": [], "newInfoFromDocs": "<what the additional docs revealed>" },
    "scalabilityPotential": { "score": <1-10>, "feedback": "<text>", "strengths": [], "improvements": [], "newInfoFromDocs": "<what the additional docs revealed>" }
  },
  "strengths": ["<top 3-5 strengths from combined materials>"],
  "improvements": ["<top 3-5 remaining areas to improve>"],
  "portfolioSynergies": ["<synergies with HoloRay, Taurus, InstaClinic, etc.>"],
  "nextSteps": ["<recommended actions>"],
  "reEvaluationNotes": "<summary of how the additional documentation changed the evaluation>",
  "dreamCreateDeliver": {
    "dream": "<vision assessment>",
    "create": "<acceleration potential>",
    "deliver": "<market path assessment>"
  }
}

---

## VITRUVIUS PORTFOLIO REFERENCE

| Company | Focus |
|---------|-------|
| HoloRay | AR surgical planning |
| Taurus Surgical | Robotic surgery |
| Spin Surgical | Cardiovascular robotics |
| InstaClinic.ai | AI medical secretary |
| AeroCardia | Cardiovascular monitoring |
| Telescope Therapeutics | Drug discovery |
| Bridge Medical | AI triage/telemedicine |
| V-Motion Academy | STEM education |`;

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const result = await extractText(uint8Array);
  const text = Array.isArray(result.text) ? result.text.join("\n") : String(result.text);
  return text;
}

async function reEvaluateWithAI(
  pitchDeckText: string,
  additionalDocsTexts: { name: string; text: string }[]
): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  // Build the combined content
  let combinedContent = `## ORIGINAL PITCH DECK\n\n${pitchDeckText}\n\n`;
  combinedContent += `## ADDITIONAL DOCUMENTATION\n\n`;

  for (const doc of additionalDocsTexts) {
    combinedContent += `### Document: ${doc.name}\n\n${doc.text}\n\n---\n\n`;
  }

  // Truncate if too long (allow more for combined docs)
  if (combinedContent.length > 120000) {
    combinedContent = combinedContent.substring(0, 120000) + "\n\n[Content truncated...]";
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "pitch2v - Vitruvius Venture Studio Re-evaluation",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Re-evaluate this startup based on the original pitch deck AND the additional documentation. Respond ONLY with the JSON object:\n\n${combinedContent}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 10000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  const messageContent = data.choices?.[0]?.message?.content;

  if (!messageContent) {
    throw new Error("No response from OpenRouter");
  }

  let jsonContent = messageContent;
  const jsonMatch = messageContent.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1];
  }

  return JSON.parse(jsonContent.trim());
}

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

    // Process all uploaded files
    const additionalFiles: StoredFile[] = [];
    const additionalTexts: { name: string; text: string }[] = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("doc_") && value instanceof File) {
        const file = value;
        const buffer = Buffer.from(await file.arrayBuffer());

        let extractedText = "";
        if (file.name.endsWith(".pdf")) {
          extractedText = await extractTextFromPDF(buffer);
        } else {
          // For non-PDF files, try to read as text
          extractedText = buffer.toString("utf-8");
        }

        const base64Data = buffer.toString("base64");

        additionalFiles.push({
          name: file.name,
          size: file.size,
          base64: base64Data,
          extractedText: extractedText,
        });

        additionalTexts.push({
          name: file.name,
          text: extractedText,
        });

        console.log(`[DOCS] Processed additional doc: ${file.name} (${extractedText.length} chars extracted)`);
      }
    }

    if (additionalFiles.length === 0) {
      return NextResponse.json(
        { error: "No documents provided" },
        { status: 400 }
      );
    }

    // Get original pitch deck text
    const originalPitchText = submission.pitchDeckFile?.extractedText || "";

    if (!originalPitchText) {
      return NextResponse.json(
        { error: "Original pitch deck text not found" },
        { status: 500 }
      );
    }

    // Re-run AI analysis with combined documents
    console.log(`[DOCS] Re-evaluating submission ${submissionId} with ${additionalFiles.length} additional docs...`);
    const reEvalAnalysis = await reEvaluateWithAI(originalPitchText, additionalTexts);
    console.log(`[DOCS] Re-evaluation complete. New score: ${reEvalAnalysis.overallScore} (was: ${submission.analysis.overallScore})`);

    // Update submission with additional docs and re-evaluation
    const allAdditionalDocs = [...(submission.additionalDocsFiles || []), ...additionalFiles];
    const combinedDocNames = [submission.fileName, ...additionalFiles.map(f => f.name)];

    updateSubmission(submissionId, {
      additionalDocsFiles: allAdditionalDocs,
      reEvaluation: {
        analysis: reEvalAnalysis as unknown as AnalysisResult,
        evaluatedAt: new Date().toISOString(),
        combinedDocuments: combinedDocNames,
      },
      status: "re-evaluated",
    });

    console.log(`[DOCS] Updated submission ${submissionId} with re-evaluation`);

    return NextResponse.json({
      success: true,
      message: "Documents received and re-evaluation complete",
      documentCount: additionalFiles.length,
      previousScore: submission.analysis.overallScore,
      newScore: reEvalAnalysis.overallScore,
      scoreChange: (reEvalAnalysis.overallScore as number) - submission.analysis.overallScore,
    });
  } catch (error) {
    console.error("Additional docs error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process documents" },
      { status: 500 }
    );
  }
}
