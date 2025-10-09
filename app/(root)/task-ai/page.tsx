import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ChatMessages from "@/components/tasks/ChatMessage";
import { NotebookPen } from "lucide-react";
import { SubmitMessageButton } from "@/components/tasks/SubmitMessageButton";

export default async function Page() {

  return (
    <div className="flex flex-col justify-center items-center mt-5 mx-2 sm:mx-auto">
      <Card className="w-full max-w-5xl rounded-2xl shadow-lg border h-[85vh] flex flex-col p-4">
        {/* Header */}
        <CardHeader className="text-center p-2">
          <NotebookPen className="ml-auto"/>
          <CardTitle className="text-lg sm:text-xl font-bold">
            AI Task Manager
          </CardTitle>
          <CardDescription>
            Chat with your AI assistant to manage tasks.
          </CardDescription>
        </CardHeader>

        {/* Chat Area */}
        <CardContent
          className="flex-1 p-0 overflow-hidden border-y-2 border-accent bg-background "
        >
          <ChatMessages />
        </CardContent>
        {/* Input Bar */}
        <CardFooter className="p-0">
          <SubmitMessageButton />
        </CardFooter>
      </Card>
    </div>
  );
}
