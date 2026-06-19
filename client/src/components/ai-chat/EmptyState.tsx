import { Sparkles } from "lucide-react";

type EmptyStateProps = {
  message: string;
  suggestedPrompts?: string[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
};

export function EmptyState({
  message,
  suggestedPrompts,
  isLoading,
  onSendMessage,
}: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="size-12 opacity-20" />
          <p className="text-sm">{message}</p>
        </div>

        {suggestedPrompts && suggestedPrompts.length > 0 && (
          <div className="flex max-w-2xl flex-wrap justify-center gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onSendMessage(prompt)}
                disabled={isLoading}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
