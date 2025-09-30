export const dynamic = "force-dynamic";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { getMessages } from "@/lib/actions/messages";
import { SubmitTaskButton } from "@/components/tasks/SubmitTaskButton";
import ChatMessages from "@/components/tasks/ChatMessage";

export default async function Page() {
  const messages = await getMessages();

  return (
    <div className="flex flex-col justify-center items-center mt-5 mx-2 sm:mx-auto">
      <Card className="w-full max-w-5xl rounded-2xl shadow-lg border h-[85vh] flex flex-col p-4">
        {/* Header */}
        <CardHeader className="text-center p-2">
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
          <ChatMessages messages={messages} />
        </CardContent>
        {/* Input Bar */}
        <CardFooter className="p-0">
          <SubmitTaskButton />
        </CardFooter>
      </Card>
    </div>
  );
}
