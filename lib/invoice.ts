import { prisma } from "@/lib/prisma";

export async function generateInvoiceNumber(date: Date = new Date()): Promise<string> {
  // 1. Determine Financial Year
  // If month is Jan-Mar (0-2), FY is (Year-1)-Year. e.g., Feb 2026 -> 25-26
  // If month is Apr-Dec (3-11), FY is Year-(Year+1). e.g., Oct 2025 -> 25-26
  const month = date.getMonth();
  const year = date.getFullYear();

  let startYear = year;
  let endYear = year + 1;

  if (month < 3) {
    startYear = year - 1;
    endYear = year;
  }

  const startYearShort = startYear.toString().slice(-2);
  const endYearShort = endYear.toString().slice(-2);
  const financialYear = `${startYearShort}-${endYearShort}`;

  const prefix = `HRI/AJM/${financialYear}/`;

  // 2. Find the last invoice number with this prefix
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc', // Assuming sequential creation matches sequential numbering
    },
    select: {
      invoiceNumber: true,
    },
  });

  let nextSequence = 1;

  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('/');
    const lastSequenceStr = parts[parts.length - 1];
    const lastSequence = parseInt(lastSequenceStr, 10);

    if (!isNaN(lastSequence)) {
      nextSequence = lastSequence + 1;
    }
  }

  return `${prefix}${nextSequence}`;
}
