import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  errorResponse,
  successResponse,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const [expiringInsurance, overdueInvoices] = await Promise.all([
      prisma.vehicle.findMany({
        where: {
          ownerId: userId,
          isActive: true,
          insuranceExpiry: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          vehicleType: { select: { name: true } },
        },
        orderBy: { insuranceExpiry: "asc" },
      }),
      prisma.invoice.count({
        where: {
          userId,
          status: "OVERDUE",
        },
      }),
    ]);

    return successResponse({
      expiringInsurance,
      overdueInvoices,
    });
  } catch (error) {
    console.error("Alerts stats error:", error);
    return errorResponse("Failed to fetch alerts stats", 500);
  }
}
