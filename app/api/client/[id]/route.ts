import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Await params before using it
    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId
      },
      include: {
        _count: {
          select: {
            jobs: true,
            invoices: true
          }
        },
        jobs: {
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
            date: "desc",
          },
        }
      }
    });

    if (!client) {
      return errorResponse('Client not found', 404);
    }

    return successResponse(client);

  } catch (error) {
    console.error('Get client error:', error);
    return errorResponse('Failed to fetch client', 500);
  }
}