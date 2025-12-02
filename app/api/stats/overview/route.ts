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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalClients,
      activeClients,
      totalDrivers,
      activeDrivers,
      totalVehicles,
      activeVehicles,
      totalJobs,
      completedJobs,
      pendingJobs,
      jobsInPeriod,
      totalRevenue,
      revenueInPeriod,
      pendingInvoices,
      overdueInvoices,
    ] = await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.client.count({ where: { userId, isActive: true } }),
      prisma.driver.count({ where: { userId } }),
      prisma.driver.count({ where: { userId, isActive: true } }),
      prisma.vehicle.count({ where: { ownerId: userId } }),
      prisma.vehicle.count({ where: { ownerId: userId, isActive: true } }),
      prisma.job.count({ where: { userId } }),
      prisma.job.count({ where: { userId, status: "COMPLETED" } }),
      prisma.job.count({ where: { userId, status: "PENDING" } }),
      prisma.job.count({
        where: {
          userId,
          date: { gte: startDate },
        },
      }),
      prisma.job.aggregate({
        where: { userId, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.job.aggregate({
        where: {
          userId,
          status: "COMPLETED",
          date: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      prisma.invoice.count({
        where: {
          userId,
          status: { in: ["SENT", "PENDING", "PARTIAL"] },
        },
      }),
      prisma.invoice.count({
        where: {
          userId,
          status: "OVERDUE",
        },
      }),
    ]);

    const totalRevenueAmount = totalRevenue._sum.amount || 0;
    const revenueInPeriodAmount = revenueInPeriod._sum.amount || 0;

    const outstandingResult = await prisma.invoice.aggregate({
      where: {
        userId,
        status: { in: ["SENT", "PENDING", "PARTIAL"] },
      },
      _sum: { balanceAmount: true },
    });
    const totalOutstanding = outstandingResult._sum.balanceAmount || 0;

    return successResponse({
      overview: {
        clients: { total: totalClients, active: activeClients },
        drivers: { total: totalDrivers, active: activeDrivers },
        vehicles: { total: totalVehicles, active: activeVehicles },
      },
      jobs: {
        total: totalJobs,
        completed: completedJobs,
        pending: pendingJobs,
        inPeriod: jobsInPeriod,
      },
      financial: {
        totalRevenue: totalRevenueAmount,
        revenueInPeriod: revenueInPeriodAmount,
        totalOutstanding,
        pendingInvoices,
        overdueInvoices,
      },
    });
  } catch (error) {
    console.error("Overview stats error:", error);
    return errorResponse("Failed to fetch overview stats", 500);
  }
}
