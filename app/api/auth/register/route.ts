import {
  errorResponse,
  generateTokenPair,
} from "@/lib/auth";
import { CreateUserSchema } from "@/lib/types";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateUserSchema.safeParse(body);
    if (!data.success) {
      return errorResponse("Incorrect  inputs");
    }
    const { name, contactNo, password, address, companyName, email } = body;
    if (
      !name ||
      !contactNo ||
      !password ||
      !address ||
      !companyName ||
      !email
    ) {
      return errorResponse("All fields are required");
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ contactNo }, ...(email ? [{ email }] : [])],
      },
    });
    if (existingUser) {
      return errorResponse(
        "User with this contact number or email already exists"
      );
    }

    //hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create user

    const user = await prisma.user.create({
      data: {
        name,
        email,
        contactNo,
        companyName,
        address,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        createdAt: true,
      },
    });

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
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("Failed to register user", 500);
  }
}


