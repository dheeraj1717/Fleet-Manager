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
    const period = searchParams.get("period") || "30"; // days
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Parallel queries for better performance
    const [
      // Overview Stats
      totalClients,
      activeClients,
      totalDrivers,
      activeDrivers,
      totalVehicles,
      activeVehicles,
      
      // Job Stats
      totalJobs,
      completedJobs,
      pendingJobs,
      jobsInPeriod,
      
      // Financial Stats
      totalRevenue,
      revenueInPeriod,
      pendingInvoices,
      overdueInvoices,
      
      // Recent Activity
      recentJobs,
      recentInvoices,
      recentPayments,
      
      // Monthly Revenue (last 6 months)
      monthlyRevenue,
      
      // Top Clients
      topClients,
      
      // Vehicle Utilization
      vehicleUsage,
      
      // Expiring Insurance
      expiringInsurance,
    ] = await Promise.all([
      // Overview Stats
      prisma.client.count({ where: { userId } }),
      prisma.client.count({ where: { userId, isActive: true } }),
      prisma.driver.count({ where: { userId } }),
      prisma.driver.count({ where: { userId, isActive: true } }),
      prisma.vehicle.count({ where: { ownerId: userId } }),
      prisma.vehicle.count({ where: { ownerId: userId, isActive: true } }),
      
      // Job Stats
      prisma.job.count({ where: { userId } }),
      prisma.job.count({ where: { userId, status: "COMPLETED" } }),
      prisma.job.count({ where: { userId, status: "PENDING" } }),
      prisma.job.count({
        where: {
          userId,
          date: { gte: startDate },
        },
      }),
      
      // Financial Stats - Total Revenue
      prisma.job.aggregate({
        where: { userId, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      
      // Revenue in Period
      prisma.job.aggregate({
        where: {
          userId,
          status: "COMPLETED",
          date: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      
      // Pending Invoices
      prisma.invoice.count({
        where: {
          userId,
          status: { in: ["SENT", "PENDING", "PARTIAL"] },
        },
      }),
      
      // Overdue Invoices
      prisma.invoice.count({
        where: {
          userId,
          status: "OVERDUE",
        },
      }),
      
      // Recent Jobs
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
      
      // Recent Invoices
      prisma.invoice.findMany({
        where: { userId },
        include: {
          client: { select: { name: true } },
          _count: { select: { jobs: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      
      // Recent Payments
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
      
      // Monthly Revenue (last 6 months)
      prisma.$queryRaw`
        SELECT 
          TO_CHAR(date, 'Mon YYYY') as month,
          CAST(SUM(amount) as FLOAT) as revenue,
          COUNT(*) as job_count
        FROM "Job"
        WHERE "userId" = ${userId}
          AND status = 'COMPLETED'
          AND date >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(date, 'Mon YYYY'), DATE_TRUNC('month', date)
        ORDER BY DATE_TRUNC('month', date) ASC
      `,
      
      // Top Clients by Revenue
      prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          c.company,
          CAST(SUM(j.amount) as FLOAT) as total_revenue,
          COUNT(j.id) as job_count
        FROM "Client" c
        LEFT JOIN "Job" j ON j."clientId" = c.id AND j.status = 'COMPLETED'
        WHERE c."userId" = ${userId}
        GROUP BY c.id, c.name, c.company
        ORDER BY total_revenue DESC
        LIMIT 5
      `,
      
      // Vehicle Utilization
      prisma.$queryRaw`
        SELECT 
          v.id,
          v."registrationNo",
          vt.name as vehicle_type,
          COUNT(j.id) as job_count,
          CAST(SUM(j.amount) as FLOAT) as total_revenue
        FROM "Vehicle" v
        LEFT JOIN "VehicleType" vt ON v."vehicleTypeId" = vt.id
        LEFT JOIN "Job" j ON j."vehicleId" = v.id AND j.status = 'COMPLETED'
        WHERE v."ownerId" = ${userId}
        GROUP BY v.id, v."registrationNo", vt.name
        ORDER BY job_count DESC
        LIMIT 5
      `,
      
      // Expiring Insurance (next 30 days)
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
    ]);

    // Calculate additional metrics
    const totalRevenueAmount = totalRevenue._sum.amount || 0;
    const revenueInPeriodAmount = revenueInPeriod._sum.amount || 0;

    // Get total outstanding (unpaid invoices)
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
        clients: {
          total: totalClients,
          active: activeClients,
        },
        drivers: {
          total: totalDrivers,
          active: activeDrivers,
        },
        vehicles: {
          total: totalVehicles,
          active: activeVehicles,
        },
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
      charts: {
        monthlyRevenue,
        topClients,
        vehicleUsage,
      },
      recentActivity: {
        jobs: recentJobs,
        invoices: recentInvoices,
        payments: recentPayments,
      },
      alerts: {
        expiringInsurance,
        overdueInvoices,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return errorResponse("Failed to fetch analytics", 500);
  }
}