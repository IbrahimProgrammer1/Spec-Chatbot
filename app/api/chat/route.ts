import { NextRequest, NextResponse } from "next/server";
import { streamResponse, generateResponse } from "@/lib/gemini";
import { ConversationContext, Phase } from "@/lib/types";

export const runtime = "nodejs";

interface RequestBody {
  message: string;
  context: ConversationContext;
  action: "chat" | "generate" | "revise";
  feedback?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { message, context, action, feedback } = body;

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const isRevision = action === "revise";

    // Use streaming for document generation
    const isDocumentPhase = [
      "constitution",
      "specification",
      "plan",
      "tasks",
      "implementation",
    ].includes(context.currentPhase);

    if (isDocumentPhase || isRevision) {
      // Stream response for longer content
      const stream = await streamResponse(context, message, isRevision, feedback);

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      });
    } else {
      // Regular response for short interactions
      const response = await generateResponse(context, message);
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}