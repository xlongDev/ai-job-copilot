import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDemoUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 30;

// POST /api/resume-upload — upload and parse resume file
export async function POST(req: NextRequest) {
  try {
    const userId = await getDemoUserId();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    
    const fileName = file.name.toLowerCase();
    const isValidExtension =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc") ||
      fileName.endsWith(".md") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".json");

    if (!isValidExtension) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, MD, TXT, or JSON." },
        { status: 400 }
      );
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let content = "";
    let format = "markdown";

    if (fileName.endsWith(".pdf")) {
      // For PDF, we extract text using a simple approach
      // In production, use pdf-parse or similar
      content = extractTextFromBuffer(buffer, "pdf");
      format = "text";
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      content = extractTextFromBuffer(buffer, "docx");
      format = "text";
    } else if (fileName.endsWith(".json")) {
      content = buffer.toString("utf-8");
      format = "json";
      // Validate JSON
      try {
        JSON.parse(content);
      } catch {
        return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 });
      }
    } else if (fileName.endsWith(".md")) {
      content = buffer.toString("utf-8");
      format = "markdown";
    } else {
      // txt
      content = buffer.toString("utf-8");
      format = "text";
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "File appears to be empty or could not be parsed" },
        { status: 400 }
      );
    }

    // Create resume record
    const title = file.name.replace(/\.[^/.]+$/, "");
    const resume = await db.resume.create({
      data: {
        userId,
        title,
        content,
        format,
        atsScore: 0,
        version: 1,
      },
    });

    return NextResponse.json({
      resume,
      message: `Successfully imported ${file.name}`,
    });
  } catch (error) {
    console.error("POST /api/resume-upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to upload resume: ${message}` },
      { status: 500 }
    );
  }
}

// Simple text extraction from buffer
// For PDF/DOCX, this extracts readable text content
function extractTextFromBuffer(buffer: Buffer, type: "pdf" | "docx"): string {
  const raw = buffer.toString("latin1");

  if (type === "pdf") {
    // Extract text between BT and ET markers (PDF text objects)
    const textMatches: string[] = [];
    const regex = /\(([^)]+)\)/g;
    let match;
    while ((match = regex.exec(raw)) !== null) {
      const text = match[1];
      // Filter out non-text content
      if (text.length > 1 && /[\u4e00-\u9fa5a-zA-Z0-9\s,.!?;:'"()-]/.test(text)) {
        textMatches.push(text);
      }
    }
    // Also try to extract from Tj/TJ operators
    const tjRegex = /\[(.*?)\]\s*TJ/g;
    while ((match = tjRegex.exec(raw)) !== null) {
      const inner = match[1];
      const stringMatches = inner.match(/\(([^)]+)\)/g);
      if (stringMatches) {
        stringMatches.forEach((s) => {
          const text = s.slice(1, -1);
          if (text.length > 0 && /[\u4e00-\u9fa5a-zA-Z0-9\s]/.test(text)) {
            textMatches.push(text);
          }
        });
      }
    }

    let result = textMatches.join("");
    // Clean up
    result = result.replace(/\\[nrt()]/g, " ").replace(/\s+/g, " ").trim();

    if (!result || result.length < 10) {
      // Fallback: extract all readable ASCII + UTF-8 sequences
      const fallback = raw
        .replace(/[^\x20-\x7E\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef\n]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return fallback.slice(0, 50000);
    }

    return result;
  }

  if (type === "docx") {
    // DOCX is a ZIP file; extract text from XML
    // Simple approach: find text between <w:t> tags
    const textMatches: string[] = [];
    const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let match;
    while ((match = regex.exec(raw)) !== null) {
      textMatches.push(match[1]);
    }

    let result = textMatches.join("");
    // Decode XML entities
    result = result
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");

    if (!result || result.length < 10) {
      // Fallback
      const fallback = raw
        .replace(/[^\x20-\x7E\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef\n]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return fallback.slice(0, 50000);
    }

    return result;
  }

  return "";
}
