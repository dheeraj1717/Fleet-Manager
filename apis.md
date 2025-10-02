// ============================================
// lib/prisma.ts - Prisma Client Setup
// ============================================
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


// ============================================
// lib/auth.ts - JWT Authentication Utilities with Refresh Tokens
// ============================================
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import crypto from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET || 'your-refresh-secret-key'
);

// Access token - short lived (15 minutes)
export async function generateAccessToken(userId: string) {
  return await new SignJWT({ userId, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

// Refresh token - long lived (7 days)
export async function generateRefreshToken(userId: string) {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  return token;
}

export async function generateTokenPair(userId: string) {
  const accessToken = await generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId);
  
  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'access') return null;
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!refreshToken) return null;
    
    // Check if expired
    if (refreshToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token } });
      return null;
    }

    // Check if user is active
    if (!refreshToken.user.isActive) {
      return null;
    }

    return refreshToken.userId;
  } catch (error) {
    return null;
  }
}

export async function revokeRefreshToken(token: string) {
  try {
    await prisma.refreshToken.delete({ where: { token } });
    return true;
  } catch (error) {
    return false;
  }
}

export async function revokeAllUserTokens(userId: string) {
  try {
    await prisma.refreshToken.deleteMany({ where: { userId } });
    return true;
  } catch (error) {
    return false;
  }
}

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const userId = await verifyAccessToken(token);
  
  return userId;
}

export function errorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

export function successResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}


// ============================================
// lib/utils.ts - Helper Functions
// ============================================
export function calculateJobAmount(totalHours: number, ratePerHour: number): number {
  return totalHours * ratePerHour;
}

export function calculateHoursBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return diff / (1000 * 60 * 60); // Convert milliseconds to hours
}


// ============================================
// app/api/auth/register/route.ts
// ============================================
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTokenPair, errorResponse, successResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, contactNo, password } = body;

    // Validation
    if (!name || !contactNo || !password) {
      return errorResponse('Name, contact number, and password are required');
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { contactNo },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      return errorResponse('User with this contact number or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        contactNo,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        createdAt: true
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokenPair(user.id);

    return successResponse({
      user,
      accessToken,
      refreshToken
    }, 201);

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Failed to register user', 500);
  }
}


// ============================================
// app/api/auth/login/route.ts
// ============================================
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTokenPair, errorResponse, successResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactNo, password } = body;

    if (!contactNo || !password) {
      return errorResponse('Contact number and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { contactNo }
    });

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse('Account is deactivated', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return errorResponse('Invalid credentials', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokenPair(user.id);

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Failed to login', 500);
  }
}


// ============================================
// app/api/clients/route.ts
// ============================================
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


// ============================================
// app/api/clients/[id]/route.ts
// ============================================
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        _count: {
          select: {
            jobs: true,
            invoices: true
          }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, email, contactNo, company, address, isActive } = body;

    // Verify ownership
    const existing = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId
      }
    });

    if (!existing) {
      return errorResponse('Client not found', 404);
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(contactNo && { contactNo }),
        ...(company !== undefined && { company }),
        ...(address && { address }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return successResponse(client);

  } catch (error) {
    console.error('Update client error:', error);
    return errorResponse('Failed to update client', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Verify ownership
    const existing = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId
      }
    });

    if (!existing) {
      return errorResponse('Client not found', 404);
    }

    // Soft delete
    await prisma.client.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return successResponse({ message: 'Client deactivated successfully' });

  } catch (error) {
    console.error('Delete client error:', error);
    return errorResponse('Failed to delete client', 500);
  }
}


// ============================================
// app/api/vehicle-types/route.ts
// ============================================
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const vehicleTypes = await prisma.vehicleType.findMany({
      where: { userId },
      include: {
        _count: {
          select: { vehicles: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return successResponse(vehicleTypes);

  } catch (error) {
    console.error('Get vehicle types error:', error);
    return errorResponse('Failed to fetch vehicle types', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return errorResponse('Name is required');
    }

    // Check if already exists
    const existing = await prisma.vehicleType.findFirst({
      where: { userId, name }
    });

    if (existing) {
      return errorResponse('Vehicle type with this name already exists');
    }

    const vehicleType = await prisma.vehicleType.create({
      data: {
        userId,
        name,
        description
      }
    });

    return successResponse(vehicleType, 201);

  } catch (error) {
    console.error('Create vehicle type error:', error);
    return errorResponse('Failed to create vehicle type', 500);
  }
}


// ============================================
// app/api/vehicles/route.ts
// ============================================
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

    const vehicles = await prisma.vehicle.findMany({
      where: {
        ownerId: userId,
        ...(isActive !== null && { isActive: isActive === 'true' })
      },
      include: {
        vehicleType: true
      },
      orderBy: { registrationNo: 'asc' }
    });

    return successResponse(vehicles);

  } catch (error) {
    console.error('Get vehicles error:', error);
    return errorResponse('Failed to fetch vehicles', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { registrationNo, model, vehicleTypeId, insuranceExpiry, registrationExpiry } = body;

    if (!registrationNo || !vehicleTypeId) {
      return errorResponse('Registration number and vehicle type are required');
    }

    // Verify vehicle type belongs to user
    const vehicleType = await prisma.vehicleType.findFirst({
      where: {
        id: vehicleTypeId,
        userId
      }
    });

    if (!vehicleType) {
      return errorResponse('Invalid vehicle type');
    }

    // Check if registration exists
    const existing = await prisma.vehicle.findFirst({
      where: {
        ownerId: userId,
        registrationNo
      }
    });

    if (existing) {
      return errorResponse('Vehicle with this registration number already exists');
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: userId,
        registrationNo,
        model,
        vehicleTypeId,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        registrationExpiry: registrationExpiry ? new Date(registrationExpiry) : null
      },
      include: {
        vehicleType: true
      }
    });

    return successResponse(vehicle, 201);

  } catch (error) {
    console.error('Create vehicle error:', error);
    return errorResponse('Failed to create vehicle', 500);
  }
}


// ============================================
// app/api/drivers/route.ts
// ============================================
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


// ============================================
// app/api/jobs/route.ts
// ============================================
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { calculateHoursBetween, calculateJobAmount } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const invoiceId = searchParams.get('invoiceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const jobs = await prisma.job.findMany({
      where: {
        userId,
        ...(clientId && { clientId }),
        ...(status && { status: status as any }),
        ...(invoiceId === 'null' ? { invoiceId: null } : invoiceId ? { invoiceId } : {}),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      include: {
        client: true,
        driver: true,
        vehicle: {
          include: {
            vehicleType: true
          }
        },
        vehicleType: true,
        invoice: true
      },
      orderBy: { date: 'desc' }
    });

    return successResponse(jobs);

  } catch (error) {
    console.error('Get jobs error:', error);
    return errorResponse('Failed to fetch jobs', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const {
      clientId, driverId, vehicleId, vehicleTypeId,
      location, date, startTime, endTime,
      totalHours, ratePerHour, amount,
      description, notes, status
    } = body;

    if (!clientId || !driverId || !vehicleId || !vehicleTypeId || 
        !location || !date || !startTime || !ratePerHour) {
      return errorResponse('Missing required fields');
    }

    // Verify all relations belong to user
    const [client, driver, vehicle, vehicleType] = await Promise.all([
      prisma.client.findFirst({ where: { id: clientId, userId } }),
      prisma.driver.findFirst({ where: { id: driverId, userId } }),
      prisma.vehicle.findFirst({ where: { id: vehicleId, ownerId: userId } }),
      prisma.vehicleType.findFirst({ where: { id: vehicleTypeId, userId } })
    ]);

    if (!client || !driver || !vehicle || !vehicleType) {
      return errorResponse('Invalid client, driver, vehicle, or vehicle type');
    }

    // Calculate hours and amount if endTime provided
    let calculatedHours = totalHours;
    let calculatedAmount = amount;

    if (endTime && !totalHours) {
      calculatedHours = calculateHoursBetween(new Date(startTime), new Date(endTime));
    }

    if (calculatedHours && !calculatedAmount) {
      calculatedAmount = calculateJobAmount(calculatedHours, ratePerHour);
    }

    const job = await prisma.job.create({
      data: {
        userId,
        clientId,
        driverId,
        vehicleId,
        vehicleTypeId,
        location,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        totalHours: calculatedHours,
        ratePerHour,
        amount: calculatedAmount,
        description,
        notes,
        status: status || 'COMPLETED'
      },
      include: {
        client: true,
        driver: true,
        vehicle: {
          include: { vehicleType: true }
        },
        vehicleType: true
      }
    });

    return successResponse(job, 201);

  } catch (error) {
    console.error('Create job error:', error);
    return errorResponse('Failed to create job', 500);
  }
}


// ============================================
// app/api/invoices/generate/route.ts
// ============================================
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { clientId, startDate, endDate, tax, notes } = body;

    if (!clientId || !startDate || !endDate) {
      return errorResponse('Client ID, start date, and end date are required');
    }

    // Get unbilled completed jobs
    const jobs = await prisma.job.findMany({
      where: {
        userId,
        clientId,
        invoiceId: null,
        status: 'COMPLETED',
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    });

    if (jobs.length === 0) {
      return errorResponse('No unbilled jobs found for this period');
    }

    // Calculate totals
    const subtotal = jobs.reduce((sum, job) => sum + (job.amount || 0), 0);
    const taxAmount = tax || 0;
    const totalAmount = subtotal + taxAmount;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        clientId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        subtotal,
        tax: taxAmount,
        totalAmount,
        balanceAmount: totalAmount,
        notes,
        status: 'SENT'
      }
    });

    // Link jobs to invoice
    await prisma.job.updateMany({
      where: {
        id: { in: jobs.map(j => j.id) }
      },
      data: {
        invoiceId: invoice.id
      }
    });

    // Return invoice with jobs
    const invoiceWithJobs = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        client: true,
        jobs: {
          include: {
            driver: true,
            vehicle: {
              include: { vehicleType: true }
            }
          }
        }
      }
    });

    return successResponse(invoiceWithJobs, 201);

  } catch (error) {
    console.error('Generate invoice error:', error);
    return errorResponse('Failed to generate invoice', 500);
  }
}


// ============================================
// app/api/payments/route.ts
// ============================================
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { invoiceId, clientId, amount, paymentMethod, referenceNo, notes, paymentDate } = body;

    if (!invoiceId || !clientId || !amount || !paymentMethod) {
      return errorResponse('Invoice ID, client ID, amount, and payment method are required');
    }

    // Verify invoice belongs to user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
        clientId
      }
    });

    if (!invoice) {
      return errorResponse('Invoice not found', 404);
    }

    if (amount > invoice.balanceAmount) {
      return errorResponse('Payment amount exceeds balance amount');
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        clientId,
        amount,
        paymentMethod,
        referenceNo,
        notes,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date()
      }
    });

    // Update invoice amounts
    const newPaidAmount = invoice.paidAmount + amount;
    const newBalanceAmount = invoice.balanceAmount - amount;
    const newStatus = newBalanceAmount === 0 ? 'PAID' : 'PARTIAL';

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        status: newStatus
      }
    });

    return successResponse(payment, 201);

  } catch (error) {
    console.error('Create payment error:', error);
    return errorResponse('Failed to create payment', 500);
  }
}


// ============================================
// app/api/auth/refresh/route.ts
// ============================================
import { NextRequest } from 'next/server';
import { verifyRefreshToken, generateAccessToken, errorResponse, successResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse('Refresh token is required', 400);
    }

    // Verify refresh token
    const userId = await verifyRefreshToken(refreshToken);

    if (!userId) {
      return errorResponse('Invalid or expired refresh token', 401);
    }

    // Generate new access token
    const accessToken = await generateAccessToken(userId);

    return successResponse({
      accessToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse('Failed to refresh token', 500);
  }
}


// ============================================
// app/api/auth/logout/route.ts
// ============================================
import { NextRequest } from 'next/server';
import { revokeRefreshToken, errorResponse, successResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse('Refresh token is required', 400);
    }

    // Revoke the refresh token
    await revokeRefreshToken(refreshToken);

    return successResponse({
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('Failed to logout', 500);
  }
}


// ============================================
// app/api/auth/logout-all/route.ts
// ============================================
import { NextRequest } from 'next/server';
import { getUserFromRequest, revokeAllUserTokens, errorResponse, successResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Revoke all refresh tokens for this user
    await revokeAllUserTokens(userId);

    return successResponse({
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    return errorResponse('Failed to logout from all devices', 500);
  }
}