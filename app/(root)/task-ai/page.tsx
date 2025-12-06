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
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
                NeuraTask AI
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
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

