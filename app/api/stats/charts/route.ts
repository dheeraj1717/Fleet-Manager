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

    const [monthlyRevenue, topClients, vehicleUsage] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          TO_CHAR(date, 'Mon YYYY') as month,
          CAST(SUM(amount) as FLOAT) as revenue,
          COUNT(*) as job_count
        FROM "Job"
        WHERE "userId" = ${userId}
          AND status = 'COMPLETED'
          AND date >= ${startDate}
        GROUP BY TO_CHAR(date, 'Mon YYYY'), DATE_TRUNC('month', date)
        ORDER BY DATE_TRUNC('month', date) ASC
      `,
      prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          c.company,
          CAST(SUM(j.amount) as FLOAT) as total_revenue,
          COUNT(j.id) as job_count
        FROM "Client" c
        LEFT JOIN "Job" j ON j."clientId" = c.id 
          AND j.status = 'COMPLETED'
          AND j.date >= ${startDate}
        WHERE c."userId" = ${userId}
        GROUP BY c.id, c.name, c.company
        HAVING COUNT(j.id) > 0
        ORDER BY total_revenue DESC
        LIMIT 5
      `,
      prisma.$queryRaw`
        SELECT 
          v.id,
          v."registrationNo",
          vt.name as vehicle_type,
          COUNT(j.id) as job_count,
          CAST(SUM(j.amount) as FLOAT) as total_revenue
        FROM "Vehicle" v
        LEFT JOIN "VehicleType" vt ON v."vehicleTypeId" = vt.id
        LEFT JOIN "Job" j ON j."vehicleId" = v.id 
          AND j.status = 'COMPLETED'
          AND j.date >= ${startDate}
        WHERE v."ownerId" = ${userId}
        GROUP BY v.id, v."registrationNo", vt.name
        HAVING COUNT(j.id) > 0
        ORDER BY job_count DESC
        LIMIT 5
      `,
    ]);

    return successResponse({
      monthlyRevenue,
      topClients,
      vehicleUsage,
    });
  } catch (error) {
    console.error("Charts stats error:", error);
    return errorResponse("Failed to fetch charts stats", 500);
  }
}
