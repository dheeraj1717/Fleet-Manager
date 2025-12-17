import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { generateInvoiceNumber } from '@/lib/invoice';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);

     
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    
    const { clientId, startDate, endDate, tax, notes } = body;

    if (!clientId || !startDate || !endDate) {

      return errorResponse('Client ID, start date, and end date are required', 400);
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
      return errorResponse('No unbilled jobs found for this period', 404);
    }

    // Calculate totals
    const subtotal = jobs.reduce((sum, job) => sum + (job.amount || 0), 0);
    const round2 = (num: number) => Math.round(num * 100) / 100;
    
    const cgst = round2(subtotal * 0.09);
    const sgst = round2(subtotal * 0.09);
    const taxAmount = round2(cgst + sgst);
    const totalAmount = round2(subtotal + taxAmount);



    // Create invoice
    // Create invoice and link jobs in a transaction
    let invoice;
    let retries = 3;
    
    while (retries > 0) {
      try {
        invoice = await prisma.$transaction(async (tx) => {
            const newInvoice = await tx.invoice.create({
              data: {
                invoiceNumber: await generateInvoiceNumber(new Date(startDate)),
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
    
            const updateResult = await tx.job.updateMany({
              where: {
                id: { in: jobs.map(j => j.id) },
                invoiceId: null // Ensure they haven't been picked up by another process
              },
              data: {
                invoiceId: newInvoice.id
              }
            });
    
            if (updateResult.count !== jobs.length) {
                throw new Error("Some jobs were already invoiced during this process");
            }
            
            return newInvoice;
        });
        
        break; // Success, exit loop
      } catch (error: any) {
        // Check if unique constraint violation on invoiceNumber
        if (error.code === 'P2002' && error.meta?.target?.includes('invoiceNumber')) {
          retries--;
          console.log(`Invoice number collision, retrying... (${3 - retries}/3)`);
          if (retries === 0) throw new Error("Failed to generate unique invoice number after multiple attempts");
          continue; // Try again
        }
        throw error; // Rethrow other errors
      }
    }



    if (!invoice) {
        throw new Error("Failed to create invoice");
    }

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
    return errorResponse('Failed to generate invoice: ' + (error as Error).message, 500);
  }
}