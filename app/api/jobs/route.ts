import { errorResponse, getUserFromRequest, successResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      prisma.job.count({ where }),
    ]);

    return successResponse({ jobs, total });
  } catch (error) {
    console.error("Get jobs error:", error);
    return errorResponse("Failed to fetch jobs", 500);
  }
}
