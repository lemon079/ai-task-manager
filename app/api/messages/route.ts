import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { successResponse, ApiErrors, withErrorHandler } from "@/lib/api-utils";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const messages = await prisma.message.findMany({
      where: { chatId: `chat-${session.user.id}` },
      orderBy: { createdAt: "asc" },
    });

    return successResponse(messages);
  });
}
