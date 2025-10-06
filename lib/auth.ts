import { jwtVerify, SignJWT } from "jose";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import crypto from "crypto";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "secret112233"
);

export async function generateAccessToken(userId: string) {
  return await new SignJWT({ userId, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(JWT_SECRET);
}

// Refresh token - long lived (7 days)
export async function generateRefreshToken(userId: string) {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function generateTokenPair(userId: string) {
  const accessToken = await generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId);

  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "access") return null;
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) return null;

    // Check if expired
    if (refreshToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token } });
      return null;
    }

    // Check if user is active
    if (!refreshToken.user.isActive) {
      return null;
    }

    return refreshToken.userId;
  } catch (error) {
    return null;
  }
}

export async function revokeRefreshToken(token: string) {
  try {
    await prisma.refreshToken.delete({ where: { token } });
    return true;
  } catch (error) {
    return false;
  }
}

export async function revokeAllUserTokens(userId: string) {
  try {
    await prisma.refreshToken.deleteMany({ where: { userId } });
    return true;
  } catch (error) {
    return false;
  }
}

export async function getUserFromRequest(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if(!token) return null;
  const userId = await verifyAccessToken(token);

  return userId;
}

export function errorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

export function successResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}
