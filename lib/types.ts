export type Phase =
  | "idle"
  | "idea_collection"
  | "cross_examination"
  | "constitution"
  | "specification"
  | "plan"
  | "tasks"
  | "implementation"
  | "complete";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  phase: Phase;
  isDocument?: boolean;
  documentType?: DocumentType;
}

export type DocumentType =
  | "constitution"
  | "specification"
  | "plan"
  | "tasks"
  | "implementation";

export interface ChatState {
  messages: Message[];
  currentPhase: Phase;
  isLoading: boolean;
  error: string | null;
  idea: string | null;
  crossExaminationAnswers: string[];
  approvedDocuments: Partial<Record<DocumentType, string>>;
  currentQuestionIndex: number;
  awaitingApproval: boolean;
  currentDocument: string | null;
  currentDocumentType: DocumentType | null;
}

export interface ConversationContext {
  idea: string;
  crossExaminationQA: Array<{ question: string; answer: string }>;
  approvedDocuments: Partial<Record<DocumentType, string>>;
  currentPhase: Phase;
  refusalFeedback?: string;
}

export interface ChatRequest {
  message: string;
  context: ConversationContext;
  action: "chat" | "generate" | "revise";
}

export interface ChatResponse {
  content: string;
  nextPhase?: Phase;
  isDocument?: boolean;
  documentType?: DocumentType;
  questions?: string[];
}

export const PHASE_ORDER: Phase[] = [
  "idle",
  "idea_collection",
  "cross_examination",
  "constitution",
  "specification",
  "plan",
  "tasks",
  "implementation",
  "complete",
];

export const DOCUMENT_PHASES: Phase[] = [
  "constitution",
  "specification",
  "plan",
  "tasks",
  "implementation",
];

export const PHASE_LABELS: Record<Phase, string> = {
  idle: "Start",
  idea_collection: "Idea",
  cross_examination: "Q&A",
  constitution: "Constitution",
  specification: "Specification",
  plan: "Plan",
  tasks: "Tasks",
  implementation: "Implementation",
  complete: "Complete",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  constitution: "Constitution Document",
  specification: "Technical Specification",
  plan: "Project Plan",
  tasks: "Task Breakdown",
  implementation: "Implementation Guide",
};