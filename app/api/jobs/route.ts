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
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            company: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            contactNo: true,
            licenseNo: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            registrationNo: true,
            model: true,
            vehicleType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        vehicleType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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
      console.log("Validation errors:", data.error);
      return errorResponse("Incorrect inputs", 400);
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
      notes
    } = data.data;

    // Verify all related entities exist and belong to the user
    const [client, driver, vehicle, vehicleType] = await Promise.all([
      prisma.client.findFirst({ where: { id: clientId, userId } }),
      prisma.driver.findFirst({ where: { id: driverId, userId } }),
      prisma.vehicle.findFirst({ where: { id: vehicleId, ownerId: userId } }),
      prisma.vehicleType.findFirst({ where: { id: vehicleTypeId, userId } }),
    ]);

    if (!client || !driver || !vehicle || !vehicleType) {
      return errorResponse("Invalid client, driver, vehicle, or vehicle type", 400);
    }

    // Convert date and time strings to DateTime
    const jobDate = new Date(date);
    const [hours, minutes] = startTime.split(":");
    const jobStartTime = new Date(jobDate);
    jobStartTime.setHours(parseInt(hours), parseInt(minutes));

    const job = await prisma.job.create({
      data: {
        userId,
        clientId,
        driverId,
        vehicleId,
        vehicleTypeId,
        location,
        date: jobDate,
        startTime: jobStartTime,
        ratePerHour: parseFloat(ratePerHour.toString()),
        amount: parseFloat(amount.toString()),
        status: "COMPLETED",
        notes: notes || null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            company: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            contactNo: true,
            licenseNo: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            registrationNo: true,
            model: true,
            vehicleType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        vehicleType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return successResponse(job, 201);
  } catch (error) {
    console.error("Create job error:", error);
    return errorResponse("Failed to create job", 500);
  }
}