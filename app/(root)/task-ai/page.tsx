import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ChatMessages from "@/components/tasks/ChatMessage";
import { Sparkles, Bot } from "lucide-react";
import { SubmitMessageButton } from "@/components/tasks/SubmitMessageButton";

export default async function Page() {
  return (
    <div className="flex flex-col justify-center items-center mt-5 mx-2 sm:mx-auto">
      <Card className="w-full max-w-5xl rounded-2xl shadow-lg border h-[85vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="size-9 sm:size-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0">
              <Bot className="size-4 sm:size-5 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
                NeuraTask AI
                <Sparkles className="size-3 sm:size-4 text-primary" />
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm truncate">
                Chat with AI to manage tasks
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Chat Area */}
        <CardContent className="flex-1 p-0 overflow-hidden bg-muted/30">
          <ChatMessages />
        </CardContent>

        {/* Input Bar */}
        <CardFooter className="p-4 border-t bg-card">
          <SubmitMessageButton />
        </CardFooter>
      </Card>
    </div>
  );
}

