import { cn } from "@/lib/utils";
import { Sparkles, User } from "lucide-react";
import { Streamdown } from "streamdown";
import type { Message } from "./types";

type ChatMessageProps = {
  message: Message;
  minHeight?: number;
};

export function ChatMessage({ message, minHeight }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3",
        message.role === "user"
          ? "justify-end items-start"
          : "justify-start items-start"
      )}
      style={minHeight ? { minHeight: `${minHeight}px` } : undefined}
    >
      {message.role === "assistant" && (
        <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="size-4 text-primary" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2.5",
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {message.role === "assistant" ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Streamdown>{message.content}</Streamdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        )}
      </div>

      {message.role === "user" && (
        <div className="size-8 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center">
          <User className="size-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}
