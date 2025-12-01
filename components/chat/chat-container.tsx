"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "@/store/chat-store";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ActionButtons, RevisionInput } from "./action-buttons";
import { ProgressStepper } from "./progress-stepper";
import { Button } from "@/components/ui/button";
import { Phase, DOCUMENT_PHASES, DocumentType } from "@/lib/types";
import { RotateCcw, Sparkles } from "lucide-react";

export function ChatContainer() {
  const {
    messages,
    currentPhase,
    isLoading,
    error,
    awaitingApproval,
    currentDocument,
    currentDocumentType,
    currentQuestionIndex,
    addMessage,
    setPhase,
    setLoading,
    setError,
    setIdea,
    addCrossExaminationAnswer,
    approveDocument,
    setAwaitingApproval,
    setCurrentDocument,
    incrementQuestionIndex,
    advancePhase,
    getConversationContext,
    reset,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, awaitingApproval]);

  // Initialize conversation
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      if (currentPhase === "idle" && messages.length === 0) {
        startConversation();
      }
    }
  }, [isInitialized, currentPhase, messages.length]);

  const startConversation = async () => {
    setPhase("idea_collection");
    addMessage(
      "assistant",
      "👋 Welcome to **Spec-Kit-Plus Writer**!\n\nI'm your AI project planning assistant. I'll help you transform your idea into a fully specified project through our structured methodology.\n\n**What do you want to build today?**"
    );
  };

  const sendMessage = useCallback(
    async (message: string) => {
      if (isLoading) return;

      setLoading(true);
      setError(null);
      addMessage("user", message);

      try {
        const context = getConversationContext();

        // Handle different phases
        if (currentPhase === "idea_collection") {
          setIdea(message);
          setPhase("cross_examination");

          // Get first question
          const response = await fetchAIResponse({
            message,
            context: { ...context, idea: message, currentPhase: "cross_examination" },
            action: "chat",
          });

          addMessage("assistant", response);
          incrementQuestionIndex();
        } else if (currentPhase === "cross_examination") {
          addCrossExaminationAnswer(message);

          if (currentQuestionIndex < 3) {
            // Get next question
            const response = await fetchAIResponse({
              message,
              context: { ...context, currentPhase: "cross_examination" },
              action: "chat",
            });

            addMessage("assistant", response);
            incrementQuestionIndex();
          }

          // After 3 questions, move to constitution
          if (currentQuestionIndex >= 2) {
            setPhase("constitution");
            addMessage("system", "Cross-examination complete. Generating Constitution...");
            await generateDocument("constitution");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        addMessage("system", "Error: Failed to get response. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [currentPhase, currentQuestionIndex, isLoading]
  );

  const generateDocument = async (phase: Phase) => {
    setLoading(true);
    const context = getConversationContext();

    try {
      const response = await fetchStreamingResponse({
        message: "",
        context: { ...context, currentPhase: phase },
        action: "generate",
      });

      const docType = phase as DocumentType;
      addMessage("assistant", response, true, docType);
      setCurrentDocument(response, docType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate document");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!currentDocument || !currentDocumentType) return;

    approveDocument(currentDocumentType, currentDocument);
    addMessage("system", `✅ ${currentDocumentType.charAt(0).toUpperCase() + currentDocumentType.slice(1)} approved!`);

    // Move to next phase
    const nextPhase = getNextDocumentPhase(currentPhase);

    if (nextPhase === "complete") {
      setPhase("complete");
      addMessage(
        "assistant",
        "🎉 **Congratulations!**\n\nYour project has been fully specified using the Spec-Kit-Plus methodology. All documents have been approved:\n\n✅ Constitution\n✅ Specification\n✅ Plan\n✅ Tasks\n✅ Implementation\n\nYou now have a comprehensive blueprint for your project. Good luck with the implementation!"
      );
    } else {
      setPhase(nextPhase);
      addMessage("system", `Moving to ${nextPhase} phase...`);
      await generateDocument(nextPhase);
    }
  };

  const handleRefuse = () => {
    setShowRevisionInput(true);
  };

  const handleRevision = async (feedback: string) => {
    if (!currentDocumentType) return;

    setShowRevisionInput(false);
    setLoading(true);
    addMessage("user", `Revision request: ${feedback}`);

    try {
      const context = getConversationContext();
      const response = await fetchStreamingResponse({
        message: "",
        context,
        action: "revise",
        feedback,
      });

      addMessage("assistant", response, true, currentDocumentType);
      setCurrentDocument(response, currentDocumentType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revise document");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to start over? All progress will be lost.")) {
      reset();
      setIsInitialized(false);
    }
  };

  // Determine input placeholder based on phase
  const getPlaceholder = () => {
    if (currentPhase === "idea_collection") {
      return "Describe your project idea...";
    }
    if (currentPhase === "cross_examination") {
      return "Answer the question...";
    }
    return "Type your message...";
  };

  // Determine if input should be shown
  const showInput =
    !awaitingApproval &&
    !showRevisionInput &&
    !isLoading &&
    currentPhase !== "complete" &&
    !DOCUMENT_PHASES.includes(currentPhase);

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-900">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            <Sparkles className="w-6 h-6" />
            <span>Spec-Kit-Plus</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">AI Project Planner</p>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">
          <ProgressStepper currentPhase={currentPhase} isLoading={isLoading} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">

        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Spec-Kit-Plus</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6 pb-24">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Welcome to Spec-Kit-Plus
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  I'm your AI project planning assistant. Let's transform your idea into a professional specification.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl p-4 flex items-center gap-3 animate-slide-in">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            {/* Approval buttons */}
            {awaitingApproval && currentDocumentType && !showRevisionInput && !isLoading && (
              <div className="animate-slide-in">
                <ActionButtons
                  documentType={currentDocumentType}
                  onApprove={handleApprove}
                  onRefuse={handleRefuse}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Revision input */}
            {showRevisionInput && (
              <div className="animate-slide-in">
                <RevisionInput
                  onSubmit={handleRevision}
                  onCancel={() => setShowRevisionInput(false)}
                  isLoading={isLoading}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Floating */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {showInput && (
                  <ChatInput
                    onSend={sendMessage}
                    isLoading={isLoading}
                    placeholder={getPlaceholder()}
                  />
                )}
                {(awaitingApproval || DOCUMENT_PHASES.includes(currentPhase)) &&
                  !showRevisionInput &&
                  !isLoading && (
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center shadow-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {awaitingApproval
                          ? "Please review the document above to proceed."
                          : "Generating document content..."}
                      </p>
                    </div>
                  )}
                {currentPhase === "complete" && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      Project specification complete! 🎉
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                title="Start over"
                className="flex-shrink-0 h-12 w-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm bg-white dark:bg-slate-900"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
async function fetchAIResponse(body: {
  message: string;
  context: any;
  action: string;
  feedback?: string;
}): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  const data = await response.json();
  return data.content;
}

async function fetchStreamingResponse(body: {
  message: string;
  context: any;
  action: string;
  feedback?: string;
}): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  // Check if it's a streaming response
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("text/plain")) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
    }

    return result;
  }

  const data = await response.json();
  return data.content;
}

function getNextDocumentPhase(currentPhase: Phase): Phase {
  const order: Phase[] = [
    "constitution",
    "specification",
    "plan",
    "tasks",
    "implementation",
    "complete",
  ];
  const currentIndex = order.indexOf(currentPhase);
  return order[currentIndex + 1] || "complete";
}