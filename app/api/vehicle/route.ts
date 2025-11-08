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

  const whereCondition: any = {
    ownerId: userId,
  };

  if (search) {
    whereCondition.OR = [
      { model: { contains: search, mode: "insensitive" } },
      { registrationNo: { contains: search, mode: "insensitive" } },
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
    where: whereCondition,
    include: {
      vehicleType: {
        select: { name: true },
      },
    },
    skip: offset,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const transformedVehicles = vehicles.map((vehicle) => ({
    ...vehicle,
    vehicleType: vehicle.vehicleType.name,
  }));

  const total = await prisma.vehicle.count({
    where: whereCondition,
  });
  return successResponse({
    vehicles: transformedVehicles,
    total
  });
}

