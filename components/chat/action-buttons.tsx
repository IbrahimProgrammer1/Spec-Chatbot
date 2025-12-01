"use client";

import { Button } from "@/components/ui/button";
import { Check, X, RefreshCw } from "lucide-react";
import { DOCUMENT_TYPE_LABELS, DocumentType } from "@/lib/types";

interface ActionButtonsProps {
  documentType: DocumentType;
  onApprove: () => void;
  onRefuse: () => void;
  isLoading?: boolean;
}

export function ActionButtons({
  documentType,
  onApprove,
  onRefuse,
  isLoading,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
        Review the <strong>{DOCUMENT_TYPE_LABELS[documentType]}</strong> above.
        <br />
        Do you approve this document?
      </p>
      <div className="flex gap-3">
        <Button
          onClick={onApprove}
          variant="success"
          disabled={isLoading}
          className="gap-2"
        >
          <Check className="w-4 h-4" />
          Approve
        </Button>
        <Button
          onClick={onRefuse}
          variant="destructive"
          disabled={isLoading}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Request Changes
        </Button>
      </div>
    </div>
  );
}

interface RevisionInputProps {
  onSubmit: (feedback: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RevisionInput({
  onSubmit,
  onCancel,
  isLoading,
}: RevisionInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const feedback = formData.get("feedback") as string;
    if (feedback.trim()) {
      onSubmit(feedback.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        What changes would you like? Be specific about what should be different.
      </p>
      <textarea
        name="feedback"
        className="w-full min-h-[100px] rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
        placeholder="Describe the changes you'd like to see..."
        disabled={isLoading}
        autoFocus
      />
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Revise Document
        </Button>
      </div>
    </form>
  );
}