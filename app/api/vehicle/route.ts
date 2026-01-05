import { errorResponse, getUserFromRequest, successResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateVehicleSchema } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const userId = await getUserFromRequest(request);
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  const body = await request.json();
  const data = CreateVehicleSchema.safeParse(body);

  if (!data.success) {
    return errorResponse("Incorrect inputs", 400);
  }

  const { vehicleTypeId, model, registrationNo, insuranceExpiry } = data.data;

  // Check if registration exists
  const existing = await prisma.vehicle.findFirst({
    where: {
      ownerId: userId,
      registrationNo,
    },
  });

  if (existing) {
    return errorResponse(
      "Vehicle with this registration number already exists",
      400
    );
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      model,
      vehicleTypeId,
      registrationNo,
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
      ownerId: userId,
    },
  });

  return new Response(JSON.stringify(vehicle), { status: 201 });
}

export async function GET(request: NextRequest) {
  const userId = await getUserFromRequest(request);
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");
  const search = searchParams.get("search") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const whereCondition: any = {
    ownerId: userId,
  };

  if (search) {
    whereCondition.OR = [
      { model: { contains: search, mode: "insensitive" } },
      { registrationNo: { contains: search, mode: "insensitive" } },
    ];
  }

  // Fuel filters condition
  const fuelWhere: any = {};
  if (startDate && endDate) {
    fuelWhere.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const vehicles = await prisma.vehicle.findMany({
    where: whereCondition,
    include: {
      vehicleType: {
        select: { name: true },
      },
      fuelEntries: {
        where: fuelWhere,
        select: {
          amount: true,
          liters: true,
        },
      },
    },
    skip: offset,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const transformedVehicles = vehicles.map((vehicle) => {
    const totalFuelCost = vehicle.fuelEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
    const totalFuelLiters = vehicle.fuelEntries.reduce(
      (sum, entry) => sum + entry.liters,
      0
    );

    return {
      ...vehicle,
      vehicleType: vehicle.vehicleType.name,
      totalFuelCost,
      totalFuelLiters,
      fuelEntries: undefined, // Don't send raw entries
    };
  });

  // Calculate fleet-wide stats
  const allFuelEntries = await prisma.fuelEntry.findMany({
    where: {
      vehicle: { ownerId: userId },
      ...(startDate && endDate
        ? { date: { gte: new Date(startDate), lte: new Date(endDate) } }
        : {}),
    },
    select: {
      amount: true,
      liters: true,
    },
  });

  const fleetStats = {
    totalCost: allFuelEntries.reduce((sum, entry) => sum + entry.amount, 0),
    totalLiters: allFuelEntries.reduce((sum, entry) => sum + entry.liters, 0),
    count: await prisma.vehicle.count({
      where: { ownerId: userId, isActive: true },
    }),
  };

  const total = await prisma.vehicle.count({
    where: whereCondition,
  });

  return successResponse({
    vehicles: transformedVehicles,
    total,
    stats: fleetStats,
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Vehicle ID is required", 400);
    }

    // Verify ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!vehicle) {
      return errorResponse("Vehicle not found", 404);
    }

    if (vehicle.ownerId !== userId) {
      return errorResponse("Unauthorized", 403);
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return successResponse({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    return errorResponse("Failed to delete vehicle", 500);
  }
}
