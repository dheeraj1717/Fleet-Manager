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

    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
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
            address: true,
          },
        },
        jobs: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                contactNo: true,
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
            date: 'asc',
          },
        },
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
      },
    });

    if (!invoice) {
      return errorResponse('Invoice not found', 404);
    }

    return successResponse(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    return errorResponse('Failed to fetch invoice', 500);
  }
}