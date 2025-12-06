import { errorResponse, getUserFromRequest, successResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateVehicleTypeSchema } from "@/lib/types";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
    try {
        const userId = await getUserFromRequest(request);
        if (!userId) {
            return errorResponse("Unauthorized", 401);
        }
        const vehicleTypes = await prisma.vehicleType.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                name: true,
                description: true
            }
        });
        return successResponse(vehicleTypes,200);
    } catch (error) {

        return errorResponse("Something went wrong", 500);
    }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }
    const body = await request.json();
    const data = CreateVehicleTypeSchema.safeParse(body);
    if (!data.success) {
      return errorResponse("Incorrect  inputs");
    }
    const { name, description } = body;
    if (!name) {
      return errorResponse("Name is required", 400);
    }
    //check if already exists
    const existing = await prisma.vehicleType.findFirst({
      where: {
        userId,
        name,
      },
    });
    if (existing) {
      return errorResponse("Vehicle with this name already exists", 400);
    }
    const vehicleType = await prisma.vehicleType.create({
      data: {
        userId,
        name,
        description,
      },
    });

    return successResponse(vehicleType, 201);
  } catch (error) {

    return errorResponse("Failed to create vehicle type", 500);
  }
}
