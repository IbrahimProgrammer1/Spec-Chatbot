"use client";

import { Message, DOCUMENT_TYPE_LABELS } from "@/lib/types";
import { clsx } from "clsx";
import { Bot, User, FileText, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isAssistant = message.role === "assistant";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-fade-in">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
          <Info className="w-4 h-4" />
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx("flex gap-4 mb-6 animate-fade-in", {
        "flex-row-reverse": isUser,
      })}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
          {
            "bg-indigo-600 text-white": isUser,
            "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400": isAssistant,
          }
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content */}
      <div
        className={clsx("flex flex-col max-w-[85%] md:max-w-[75%]", {
          "items-end": isUser,
          "items-start": !isUser,
        })}
      >
        {/* Document Badge */}
        {message.isDocument && message.documentType && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md w-fit">
            <FileText className="w-3 h-3" />
            {DOCUMENT_TYPE_LABELS[message.documentType]}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={clsx("rounded-2xl px-5 py-4 shadow-sm", {
            "bg-indigo-600 text-white rounded-tr-none": isUser,
            "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700":
              isAssistant && !message.isDocument,
            "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-tl-none w-full text-slate-900 dark:text-slate-100":
              isAssistant && message.isDocument,
          })}
        >
          {message.isDocument ? (
            <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}