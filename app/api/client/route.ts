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
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const search = searchParams.get("search")||"";

     const whereCondition: any = {
      userId,
      ...(isActive !== null && { isActive: isActive === "true" }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { contactNo: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [clients, totalCount] = await Promise.all([
      prisma.client.findMany({
     where: whereCondition,
        orderBy: { name: "asc" },
        ...(limit && { take: parseInt(limit) }),
        ...(offset && { skip: parseInt(offset) }),
      }),
      prisma.client.count({where:whereCondition}),
    ])

    return successResponse({clients,totalCount});

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

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { name, email, contactNo, company, address, isActive } = body;

    if (name !== undefined && !name) {
      return errorResponse('Name cannot be empty');
    }
    if (contactNo !== undefined && !contactNo) {
      return errorResponse('Contact number cannot be empty');
    }
    if (address !== undefined && !address) {
      return errorResponse('Address cannot be empty');
    }

    if (contactNo) {
      const existing = await prisma.client.findFirst({
        where: {
          userId,
          contactNo,
          NOT: { id }
        }
      });

      if (existing) {
        return errorResponse('Client with this contact number already exists');
      }
    }

    const existingClient = await prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient || existingClient.userId !== userId) {
      return errorResponse('Client not found', 404);
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(contactNo !== undefined && { contactNo }),
        ...(company !== undefined && { company }),
        ...(address !== undefined && { address }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    return successResponse(client);

  } catch (error) {
    console.error('Update client error:', error);
    return errorResponse('Failed to update client', 500);
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

