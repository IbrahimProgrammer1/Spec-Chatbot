import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ChatState,
  Message,
  Phase,
  DocumentType,
  PHASE_ORDER,
  DOCUMENT_PHASES,
  ConversationContext,
} from "@/lib/types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

interface ChatStore extends ChatState {
  // Actions
  addMessage: (
    role: Message["role"],
    content: string,
    isDocument?: boolean,
    documentType?: DocumentType
  ) => void;
  setPhase: (phase: Phase) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIdea: (idea: string) => void;
  addCrossExaminationAnswer: (answer: string) => void;
  approveDocument: (type: DocumentType, content: string) => void;
  setAwaitingApproval: (awaiting: boolean) => void;
  setCurrentDocument: (doc: string | null, type: DocumentType | null) => void;
  incrementQuestionIndex: () => void;
  getNextPhase: () => Phase;
  advancePhase: () => void;
  getConversationContext: () => ConversationContext;
  reset: () => void;
}

const initialState: ChatState = {
  messages: [],
  currentPhase: "idle",
  isLoading: false,
  error: null,
  idea: null,
  crossExaminationAnswers: [],
  approvedDocuments: {},
  currentQuestionIndex: 0,
  awaitingApproval: false,
  currentDocument: null,
  currentDocumentType: null,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addMessage: (role, content, isDocument = false, documentType) => {
        const message: Message = {
          id: generateId(),
          role,
          content,
          timestamp: new Date(),
          phase: get().currentPhase,
          isDocument,
          documentType,
        };
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      setPhase: (phase) => set({ currentPhase: phase }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setIdea: (idea) => set({ idea }),

      addCrossExaminationAnswer: (answer) =>
        set((state) => ({
          crossExaminationAnswers: [...state.crossExaminationAnswers, answer],
        })),

      approveDocument: (type, content) =>
        set((state) => ({
          approvedDocuments: {
            ...state.approvedDocuments,
            [type]: content,
          },
          awaitingApproval: false,
          currentDocument: null,
          currentDocumentType: null,
        })),

      setAwaitingApproval: (awaiting) => set({ awaitingApproval: awaiting }),

      setCurrentDocument: (doc, type) =>
        set({
          currentDocument: doc,
          currentDocumentType: type,
          awaitingApproval: doc !== null,
        }),

      incrementQuestionIndex: () =>
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        })),

      getNextPhase: () => {
        const { currentPhase } = get();
        const currentIndex = PHASE_ORDER.indexOf(currentPhase);
        if (currentIndex < PHASE_ORDER.length - 1) {
          return PHASE_ORDER[currentIndex + 1];
        }
        return currentPhase;
      },

      advancePhase: () => {
        const nextPhase = get().getNextPhase();
        set({
          currentPhase: nextPhase,
          currentQuestionIndex: 0,
        });
      },

      getConversationContext: (): ConversationContext => {
        const state = get();

        // Build Q&A from messages
        const crossExaminationQA: Array<{ question: string; answer: string }> =
          [];
        const qaMessages = state.messages.filter(
          (m) => m.phase === "cross_examination"
        );

        for (let i = 0; i < qaMessages.length; i += 2) {
          if (qaMessages[i] && qaMessages[i + 1]) {
            crossExaminationQA.push({
              question: qaMessages[i].content,
              answer: qaMessages[i + 1].content,
            });
          }
        }

        return {
          idea: state.idea || "",
          crossExaminationQA,
          approvedDocuments: state.approvedDocuments,
          currentPhase: state.currentPhase,
        };
      },

      reset: () => set(initialState),
    }),
    {
      name: "spec-kit-chat-storage",
      partialize: (state) => ({
        messages: state.messages,
        currentPhase: state.currentPhase,
        idea: state.idea,
        crossExaminationAnswers: state.crossExaminationAnswers,
        approvedDocuments: state.approvedDocuments,
        currentQuestionIndex: state.currentQuestionIndex,
      }),
    }
  )
);