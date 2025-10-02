import { errorResponse, generateTokenPair } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/types";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = LoginSchema.safeParse(body);
    if (!data.success) {
      return errorResponse("Incorrect  inputs");
    }
    const { contactNo, password } = body;
    if (!contactNo || !password) {
      return errorResponse("All fields are required");
    }
    //find user
    const user = await prisma.user.findUnique({
      where: {
        contactNo,
      },
    });
    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }
    // Check if user is active
    if (!user.isActive) {
      return errorResponse("Account is deactivated", 401);
    }
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return errorResponse("Invalid credentials", 401);
    }
    const { accessToken, refreshToken } = await generateTokenPair(user.id);
    const response = new Response(JSON.stringify({ user }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // append multiple cookies
    response.headers.append(
      "Set-Cookie",
      `accessToken=${accessToken}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${
        60 * 15 //15 minutes
      }`
    );
    response.headers.append(
      "Set-Cookie",
      `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${
        60 * 60 * 24 * 7 //7 days
      }`
    );

    return response;
  } catch (error) {}
}
