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

    const [recentJobs, recentInvoices, recentPayments] = await Promise.all([
      prisma.job.findMany({
        where: { userId },
        include: {
          client: { select: { name: true } },
          driver: { select: { name: true } },
          vehicle: { select: { registrationNo: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: { userId },
        include: {
          client: { select: { name: true } },
          _count: { select: { jobs: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.payment.findMany({
        where: {
          invoice: { userId },
        },
        include: {
          client: { select: { name: true } },
          invoice: { select: { invoiceNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return successResponse({
      jobs: recentJobs,
      invoices: recentInvoices,
      payments: recentPayments,
    });
  } catch (error) {
    console.error("Recent stats error:", error);
    return errorResponse("Failed to fetch recent stats", 500);
  }
}
