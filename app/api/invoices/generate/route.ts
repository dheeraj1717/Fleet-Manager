import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    console.log('Generate invoice - User ID:', userId);
    
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    console.log('Generate invoice - Request body:', body);
    
    const { clientId, startDate, endDate, tax, notes } = body;

    if (!clientId || !startDate || !endDate) {
      console.log('Missing required fields:', { clientId, startDate, endDate });
      return errorResponse('Client ID, start date, and end date are required', 400);
    }

    console.log('Searching for unbilled jobs with criteria:', {
      userId,
      clientId,
      startDate,
      endDate,
      invoiceId: null,
      status: 'COMPLETED'
    });

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

    console.log('Found jobs:', jobs.length);
    console.log('Job details:', jobs.map(j => ({ id: j.id, date: j.date, amount: j.amount })));

    if (jobs.length === 0) {
      return errorResponse('No unbilled jobs found for this period', 404);
    }

    // Calculate totals
    const subtotal = jobs.reduce((sum, job) => sum + (job.amount || 0), 0);
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const taxAmount = cgst + sgst;
    const totalAmount = subtotal + taxAmount;

    console.log('Invoice calculations:', {
      subtotal,
      cgst,
      sgst,
      taxAmount,
      totalAmount
    });

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
        notes: notes || null,
        status: 'SENT'
      }
    });

    console.log('Invoice created:', invoice.id);

    // Link jobs to invoice
    const updateResult = await prisma.job.updateMany({
      where: {
        id: { in: jobs.map(j => j.id) }
      },
      data: {
        invoiceId: invoice.id
      }
    });

    console.log('Jobs linked to invoice:', updateResult.count);

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

    console.log('Returning invoice with', invoiceWithJobs?.jobs.length, 'jobs');

    return successResponse(invoiceWithJobs, 201);

  } catch (error) {
    console.error('Generate invoice error:', error);
    return errorResponse('Failed to generate invoice: ' + (error as Error).message, 500);
  }
}