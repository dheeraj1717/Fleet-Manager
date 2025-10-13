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
    const isActive = searchParams.get('isActive');

    const clients = await prisma.client.findMany({
      where: {
        userId,
        ...(isActive !== null && { isActive: isActive === 'true' })
      },
      orderBy: {
        name: 'asc'
      }
    });

    return successResponse(clients);

  } catch (error) {
    console.error('Get clients error:', error);
    return errorResponse('Failed to fetch clients', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, email, contactNo, company, address } = body;

    if (!name || !contactNo || !address) {
      return errorResponse('Name, contact number, and address are required');
    }

    // Check if contact already exists for this user
    const existing = await prisma.client.findFirst({
      where: {
        userId,
        contactNo
      }
    });

    if (existing) {
      return errorResponse('Client with this contact number already exists');
    }

    const client = await prisma.client.create({
      data: {
        userId,
        name,
        email,
        contactNo,
        company,
        address
      }
    });

    return successResponse(client, 201);

  } catch (error) {
    console.error('Create client error:', error);
    return errorResponse('Failed to create client', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Client ID is required');
    }

    const client = await prisma.client.delete({
      where: {
        id,
        userId
      }
    });

    return successResponse(client);

  } catch (error) {
    console.error('Delete client error:', error);
    return errorResponse('Failed to delete client', 500);
  }
}   

