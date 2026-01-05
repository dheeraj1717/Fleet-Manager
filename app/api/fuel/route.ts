import { errorResponse, getUserFromRequest, successResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateFuelEntrySchema } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");

    if (!vehicleId) {
      return errorResponse("Vehicle ID is required", 400);
    }

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, ownerId: userId },
    });

    if (!vehicle) {
      return errorResponse("Vehicle not found", 404);
    }

    const fuelEntries = await prisma.fuelEntry.findMany({
      where: { vehicleId },
      orderBy: { date: "desc" },
    });

    return successResponse(fuelEntries);
  } catch (error) {
    console.error("Get fuel entries error:", error);
    return errorResponse("Failed to fetch fuel entries", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const data = CreateFuelEntrySchema.safeParse(body);

    if (!data.success) {
      return errorResponse("Incorrect inputs", 400);
    }

    const { vehicleId, date, liters, amount } = data.data;

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, ownerId: userId },
    });

    if (!vehicle) {
      return errorResponse("Vehicle not found", 404);
    }

    const fuelEntry = await prisma.fuelEntry.create({
      data: {
        vehicleId,
        date: new Date(date),
        liters,
        amount,
      },
    });

    return successResponse(fuelEntry, 201);
  } catch (error) {
    console.error("Create fuel entry error:", error);
    return errorResponse("Failed to create fuel entry", 500);
  }
}
