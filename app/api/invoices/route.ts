import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        ...(status && status !== 'all' && { status: status as any }),
        ...(clientId && { clientId }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        _count: {
          select: {
            jobs: true,
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    return errorResponse('Failed to fetch invoices', 500);
  }
}