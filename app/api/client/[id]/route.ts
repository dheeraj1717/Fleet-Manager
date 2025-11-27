import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) return errorResponse('Unauthorized', 401);

    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    // Fetch client
    const client = await prisma.client.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { jobs: true, invoices: true }
        }
      }
    });

    if (!client) return errorResponse("Client not found", 404);

    // Fetch paginated jobs
    const jobs = await prisma.job.findMany({
      where: { clientId: id },
      include: {
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
      skip,
      take: limit,
    });

    // Total jobs count (not paginated)
    const totalJobs = await prisma.job.count({
      where: { clientId: id },
    });
    const totals = await prisma.job.aggregate({
      where: { clientId: id },
      _sum: {
        totalHours: true,
        amount: true,
      }
    });

    const totalHours = totals._sum.totalHours || 0;
    const totalAmount = totals._sum.amount || 0;

    return successResponse({
      client,
      jobs,
      totalJobs,
      totalHours,
      totalAmount,
      page,
      limit,
    });

  } catch (error) {
    console.error("Get client error:", error);
    return errorResponse("Failed to fetch client", 500);
  }
}
