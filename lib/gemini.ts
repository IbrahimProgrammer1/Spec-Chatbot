import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, getPhasePrompt } from "./prompts";
import { ConversationContext, Phase, ChatResponse } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateResponse(
  context: ConversationContext,
  userMessage: string,
  isRevision: boolean = false,
  feedback?: string
): Promise<ChatResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: SYSTEM_PROMPT,
  });

  const prompt = getPhasePrompt(
    context.currentPhase,
    context,
    userMessage,
    isRevision,
    feedback
  );

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    return {
      content,
      isDocument: isDocumentPhase(context.currentPhase),
      documentType: getDocumentType(context.currentPhase),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate response from AI");
  }
}

function isDocumentPhase(phase: Phase): boolean {
  return [
    "constitution",
    "specification",
    "plan",
    "tasks",
    "implementation",
  ].includes(phase);
}

function getDocumentType(phase: Phase) {
  const mapping: Record<string, string> = {
    constitution: "constitution",
    specification: "specification",
    plan: "plan",
    tasks: "tasks",
    implementation: "implementation",
  };
  return mapping[phase] as any;
}

export async function streamResponse(
  context: ConversationContext,
  userMessage: string,
  isRevision: boolean = false,
  feedback?: string
): Promise<ReadableStream> {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: SYSTEM_PROMPT,
  });

  const prompt = getPhasePrompt(
    context.currentPhase,
    context,
    userMessage,
    isRevision,
    feedback
  );

  const result = await model.generateContentStream(prompt);

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}