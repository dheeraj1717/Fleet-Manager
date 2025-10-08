import { errorResponse, revokeRefreshToken } from "@/lib/auth";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Revoke refresh token from database
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    const response = new Response(
      JSON.stringify({ message: "Logged out successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Clear cookies
    response.headers.append(
      "Set-Cookie",
      "accessToken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );
    
    response.headers.append(
      "Set-Cookie",
      "refreshToken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Logout failed", 500);
  }
}