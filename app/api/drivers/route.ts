import { errorResponse, getUserFromRequest, successResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateDriverSchema } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const data = CreateDriverSchema.safeParse(body);

    if (!data.success) {
      return errorResponse("Incorrect  inputs");
    }
    if (
      !data.data.name ||
      !data.data.address ||
      !data.data.contactNo ||
      !data.data.licenseNo
    ) {
      return errorResponse(
        "Name, address, contact number, and license number are required"
      );
    }
    const { name, address, contactNo, licenseNo, joiningDate } = data.data;
    // Check duplicates
    const existing = await prisma.driver.findFirst({
      where: {
        userId,
        OR: [{ contactNo }, { licenseNo }],
      },
    });

    if (existing) {
      return errorResponse(
        "Driver with this contact number or license already exists"
      );
    }

    const driver = await prisma.driver.create({
      data: {
        userId,
        name,
        address,
        contactNo,
        licenseNo,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
      },
    });

    return successResponse(driver, 201);
  } catch (error) {
    console.error("Create driver error:", error);
    return errorResponse("Failed to create driver", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const search = searchParams.get("search")?.trim() || "";

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

    const [drivers, totalCount] = await Promise.all([
      prisma.driver.findMany({
        where: whereCondition,
        orderBy: { name: "asc" },
        ...(limit && { take: parseInt(limit) }),
        ...(offset && { skip: parseInt(offset) }),
      }),
      prisma.driver.count({ where: whereCondition }),
    ]);

    return successResponse({
      drivers,
      totalCount,
    });
  } catch (error) {
    console.error("Get drivers error:", error);
    return errorResponse("Failed to fetch drivers", 500);
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Driver ID is required");
    }

    // Check for independent records
    const jobCount = await prisma.job.count({ where: { driverId: id } });
    if (jobCount > 0) {
      return errorResponse("Cannot delete driver with associated jobs", 400);
    }

    const driver = await prisma.driver.delete({
      where: {
        id,
        userId,
      },
    });

    return successResponse(driver);
  } catch (error) {
    console.error("Delete driver error:", error);
    return errorResponse("Failed to delete driver", 500);
  }
}
