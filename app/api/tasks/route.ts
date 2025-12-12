import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { successResponse, ApiErrors, withErrorHandler } from "@/lib/api-utils";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(tasks);
  });
}
