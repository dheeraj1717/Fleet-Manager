import { errorResponse, getUserFromRequest, successResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, address, contactNo, licenseNo, joiningDate } = body;

    if (!name || !address || !contactNo || !licenseNo) {
      return errorResponse('Name, address, contact number, and license number are required');
    }

    // Check duplicates
    const existing = await prisma.driver.findFirst({
      where: {
        userId,
        OR: [
          { contactNo },
          { licenseNo }
        ]
      }
    });

    if (existing) {
      return errorResponse('Driver with this contact number or license already exists');
    }

    const driver = await prisma.driver.create({
      data: {
        userId,
        name,
        address,
        contactNo,
        licenseNo,
        joiningDate: joiningDate ? new Date(joiningDate) : null
      }
    });

    return successResponse(driver, 201);

  } catch (error) {
    console.error('Create driver error:', error);
    return errorResponse('Failed to create driver', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const drivers = await prisma.driver.findMany({
      where: {
        userId,
        ...(isActive !== null && { isActive: isActive === 'true' })
      },
      orderBy: { name: 'asc' }
    });

    return successResponse(drivers);

  } catch (error) {
    console.error('Get drivers error:', error);
    return errorResponse('Failed to fetch drivers', 500);
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
      return errorResponse('Driver ID is required');
    }

    const driver = await prisma.driver.delete({
      where: {
        id,
        userId
      }
    });

    return successResponse(driver);

  } catch (error) {
    console.error('Delete driver error:', error);
    return errorResponse('Failed to delete driver', 500);
  }
}   
