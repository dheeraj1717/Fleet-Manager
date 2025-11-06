import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  errorResponse,
  successResponse,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");
    const clientId = searchParams.get("clientId");

    const payments = await prisma.payment.findMany({
      where: {
        ...(invoiceId && { invoiceId }),
        ...(clientId && { clientId }),
        invoice: {
          userId,
        },
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    return successResponse(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    return errorResponse("Failed to fetch payments", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const {
      invoiceId,
      clientId,
      amount,
      paymentMethod,
      referenceNo,
      notes,
      paymentDate,
    } = body;

    console.log("Payment request:", body);

    if (!invoiceId || !clientId || !amount || !paymentMethod) {
      return errorResponse(
        "Invoice ID, client ID, amount, and payment method are required",
        400
      );
    }

    // Verify invoice belongs to user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
        clientId,
      },
    });

    if (!invoice) {
      return errorResponse("Invoice not found", 404);
    }

    if (amount > invoice.balanceAmount) {
      return errorResponse("Payment amount exceeds balance amount", 400);
    }

    if (amount <= 0) {
      return errorResponse("Payment amount must be greater than zero", 400);
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        clientId,
        amount: parseFloat(amount.toString()),
        paymentMethod,
        referenceNo: referenceNo || null,
        notes: notes || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });

    console.log("Payment created:", payment);

    // Update invoice amounts
    const newPaidAmount = invoice.paidAmount + parseFloat(amount.toString());
    const newBalanceAmount = invoice.balanceAmount - parseFloat(amount.toString());
    
    let newStatus = invoice.status;
    if (newBalanceAmount === 0) {
      newStatus = "PAID";
    } else if (newPaidAmount > 0 && newBalanceAmount > 0) {
      newStatus = "PARTIAL";
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        status: newStatus,
      },
    });

    console.log("Invoice updated:", {
      newPaidAmount,
      newBalanceAmount,
      newStatus,
    });

    return successResponse(payment, 201);
  } catch (error) {
    console.error("Create payment error:", error);
    return errorResponse("Failed to create payment", 500);
  }
}