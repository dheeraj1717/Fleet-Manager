import { errorResponse, getUserFromRequest, successResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateJobSchema } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const invoiceId = searchParams.get("invoiceId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

  
    const where: any = {
      userId,
      ...(clientId && { clientId }),
      ...(invoiceId === "null"
        ? { invoiceId: null }
        : invoiceId
        ? { invoiceId }
        : {}),
      ...(status && { status }),
      ...(startDate && endDate && {
        date: { gte: new Date(startDate), lte: new Date(endDate) },
      }),
    };

    if (search) {
      where.OR = [
        { challanNo: { contains: search, mode: "insensitive" } },
        {
          client: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          driver: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          vehicle: {
            registrationNo: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
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
                select: { id: true, name: true },
              },
            },
          },
          vehicleType: {
            select: { id: true, name: true },
          },
        },
        orderBy: { date: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.job.count({ where: where }),
    ]);

    return successResponse({ jobs, total });
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
      endTime,
      totalHours,
      ratePerHour,
      amount,
      notes,
      challanNo
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

    // Convert date string to DateTime
    const jobDate = new Date(date);
    
    // Parse start time
    const [startHours, startMinutes] = startTime.split(":");
    const jobStartTime = new Date(jobDate);
    jobStartTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    // Parse end time
    const [endHours, endMinutes] = endTime.split(":");
    const jobEndTime = new Date(jobDate);
    jobEndTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    // If end time is before start time, assume it's the next day
    if (jobEndTime < jobStartTime) {
      jobEndTime.setDate(jobEndTime.getDate() + 1);
    }
    
    const challanNoExists = await prisma.job.findFirst({
      where: {
        challanNo,
        userId,
      },
    });
    if (challanNoExists) {
      return errorResponse("Challan number already exists", 400);
    }

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
        endTime: jobEndTime,
        totalHours,
        ratePerHour: parseFloat(ratePerHour.toString()),
        amount: parseFloat(amount.toString()),
        status: "COMPLETED",
        notes: notes || null,
        challanNo
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

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Job ID is required", 400);
    }

    // First, verify the job exists and belongs to the user
    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingJob) {
      return errorResponse("Job not found", 404);
    }

    if (existingJob.userId !== userId) {
      return errorResponse("Unauthorized - You don't own this job", 403);
    }

    // Now delete the job
    const job = await prisma.job.delete({
      where: { id },
    });

    return successResponse({ message: "Job deleted successfully", job });
  } catch (error) {
    console.error("Delete job error:", error);
    return errorResponse("Failed to delete job", 500);
  }
}