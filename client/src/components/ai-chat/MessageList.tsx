import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import type { Message } from "./types";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  minHeightForLastMessage: number;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
};

export function MessageList({
  messages,
  isLoading,
  minHeightForLastMessage,
  scrollAreaRef,
}: MessageListProps) {
  const displayMessages = messages.filter((msg) => msg.role !== "system");

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col space-y-4 p-4">
        {displayMessages.map((message, index) => {
          const isLastMessage = index === displayMessages.length - 1;
          const shouldApplyMinHeight =
            isLastMessage && !isLoading && minHeightForLastMessage > 0;

          return (
            <ChatMessage
              key={index}
              message={message}
              minHeight={shouldApplyMinHeight ? minHeightForLastMessage : undefined}
            />
          );
        })}

        {isLoading && (
          <div
            className="flex items-start gap-3"
            style={
              minHeightForLastMessage > 0
                ? { minHeight: `${minHeightForLastMessage}px` }
                : undefined
            }
          >
            <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div className="rounded-lg bg-muted px-4 py-2.5">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
