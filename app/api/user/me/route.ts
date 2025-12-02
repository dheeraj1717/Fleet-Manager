import { getUserFromRequest, errorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const userId = await getUserFromRequest(request);
  
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        contactNo: true,
        address: true,
        // Don't send password!
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return errorResponse("Failed to fetch user", 500);
  }
}