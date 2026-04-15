import { MessageSquarePlusIcon } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-6">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <MessageSquarePlusIcon size={22} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1.5">Start the discussion</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Type a question or topic below. ChatGPT, Claude, and Gemini will each share their perspective when you send.
      </p>
    </div>
  );
}
