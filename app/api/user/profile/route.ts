import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  errorResponse,
  successResponse,
} from "@/lib/auth";
import { CreateUserSchema } from "@/lib/types";

// Partial schema for updates since not all fields are required to be present
const UpdateProfileSchema = CreateUserSchema.partial().omit({ password: true });

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const result = UpdateProfileSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("Invalid input data");
    }

    const { name, email, contactNo, companyName, address } = result.data;

    // Check for uniqueness if email or contactNo is being updated
    if (email || contactNo) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(email ? [{ email }] : []),
            ...(contactNo ? [{ contactNo }] : []),
          ],
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        return errorResponse(
          "User with this email or contact number already exists"
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(contactNo && { contactNo }),
        ...(companyName && { companyName }),
        ...(address && { address }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        companyName: true,
        address: true,
        createdAt: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return errorResponse("Failed to update profile", 500);
  }
}
