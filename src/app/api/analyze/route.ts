import { NextRequest, NextResponse } from "next/server";

// System prompt placeholder - will be replaced with actual prompt
const SYSTEM_PROMPT = `You are an AI analyst for Vitruvius Venture Studios, a startup incubation firm. Your task is to analyze pitch decks and evaluate their alignment with Vitruvius's investment thesis, values, and criteria.

Evaluate the pitch deck across these dimensions:
1. Vision Fit (0-100): How well does the startup's vision align with Vitruvius's focus areas?
2. Scientific Rigor (0-100): Is the science/technology sound and well-validated?
3. Market & GTM (0-100): Is the market opportunity clear with a viable go-to-market strategy?
4. Technical Feasibility (0-100): Can the technology be built and scaled?
5. Compliance & Ethics (0-100): Does the approach address regulatory and ethical considerations?
6. Team & Execution (0-100): Does the team have the capability to execute?
7. IP / Defensibility (0-100): Is there intellectual property or competitive moat?

Provide your response in the following JSON format:
{
  "overallScore": <weighted average of all scores>,
  "scores": {
    "visionFit": <score>,
    "scientificRigor": <score>,
    "marketGTM": <score>,
    "technicalFeasibility": <score>,
    "complianceEthics": <score>,
    "teamExecution": <score>,
    "ipDefensibility": <score>
  },
  "strengths": [<3-5 bullet points of what stands out positively>],
  "improvements": [<3-5 bullet points of areas to improve>]
}

Be constructive but honest in your assessment. Focus on actionable feedback.`;

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import for pdf-parse
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text;
}

async function callOpenRouter(content: string): Promise<unknown> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "pitch2v",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Please analyze the following pitch deck content and provide your assessment:\n\n${content}`,
        },
      ],
      response_format: { type: "json_object" },
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

  return JSON.parse(messageContent);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    let content = "";

    if (file) {
      // Handle file upload
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.name.endsWith(".pdf")) {
        content = await extractTextFromPDF(buffer);
      } else if (file.name.endsWith(".pptx")) {
        // For PPTX, we'd need a more complex parser
        // For now, return an error suggesting PDF
        return NextResponse.json(
          { error: "PPTX support coming soon. Please convert to PDF." },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "Unsupported file format. Please upload PDF or PPTX." },
          { status: 400 }
        );
      }
    } else if (url) {
      // Handle URL - would need to fetch and parse the content
      // This is a placeholder for URL handling
      return NextResponse.json(
        { error: "URL parsing coming soon. Please upload a file directly." },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "No file or URL provided" },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 100) {
      return NextResponse.json(
        { error: "Could not extract sufficient content from the document" },
        { status: 400 }
      );
    }

    // Truncate content if too long (to fit within model context)
    const maxChars = 50000;
    if (content.length > maxChars) {
      content = content.substring(0, maxChars) + "\n\n[Content truncated...]";
    }

    const result = await callOpenRouter(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
