import { errorResponse, getUserFromRequest, successResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateJobSchema } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserFromRequest(request);
        if (!userId) {
            return errorResponse("Unauthorized", 401);
        }
        const jobs = await prisma.job.findMany({
            where: {
                userId,
            },
        });
        return successResponse(jobs);
    } catch (error) {
        console.error("Get jobs error:", error);
        return errorResponse("Failed to fetch jobs", 500);
    }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }
    const body = await request.json();
    const data = CreateJobSchema.safeParse(body);

    if (!data.success) {
      return errorResponse("Incorrect  inputs");
    }

    const {
      clientId,
      driverId,
      vehicleId,
      vehicleTypeId,
      location,
      date,
      startTime,
      ratePerHour,
      amount,
      status
    } = body;

    if (
      !clientId ||
      !driverId ||
      !vehicleId ||
      !vehicleTypeId ||
      !location ||
      !date ||
      !startTime ||
      !ratePerHour ||
      !amount
    ) {
      return errorResponse("Missing required fields");
    }

     const [client, driver, vehicle, vehicleType] = await Promise.all([
      prisma.client.findFirst({ where: { id: clientId, userId } }),
      prisma.driver.findFirst({ where: { id: driverId, userId } }),
      prisma.vehicle.findFirst({ where: { id: vehicleId, ownerId: userId } }),
      prisma.vehicleType.findFirst({ where: { id: vehicleTypeId, userId } })
    ]);
      if (!client || !driver || !vehicle || !vehicleType) {
      return errorResponse('Invalid client, driver, vehicle, or vehicle type');
    }

    const job = await prisma.job.create({
      data: {
        userId,
        clientId,
        driverId,
        vehicleId,
        vehicleTypeId,
        location,
        date,
        startTime,
        ratePerHour,
        amount,
        status: status || 'COMPLETED'
      },
      include: {
        client: true,
        driver: true,
        vehicle: {
          include: { vehicleType: true }
        },
        vehicleType: true
      }
    })
    return successResponse(job, 201);
  } catch (error) {
    console.error("Create job error:", error);
    return errorResponse("Failed to create job", 500);
  }
}
