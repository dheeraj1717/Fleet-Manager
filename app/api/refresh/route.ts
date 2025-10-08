import { errorResponse, generateAccessToken, verifyRefreshToken } from "@/lib/auth";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return errorResponse("Refresh token not found", 401);
    }

    // Verify refresh token
    const userId = await verifyRefreshToken(refreshToken);

    if (!userId) {
      return errorResponse("Invalid or expired refresh token", 401);
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken(userId);

    const response = new Response(
      JSON.stringify({ message: "Token refreshed successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Set new access token cookie
    response.headers.append(
      "Set-Cookie",
      `accessToken=${newAccessToken}; Path=/; HttpOnly; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=${60 * 15}` // 15 minutes
    );

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return errorResponse("Failed to refresh token", 500);
  }
}