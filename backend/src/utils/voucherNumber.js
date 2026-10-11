/**
 * Atomically generates next sequential voucher number inside a Prisma transaction
 * Format: VCH-YYYY-0001
 * E.g., VCH-2026-0001, VCH-2026-0002
 */
async function generateVoucherNumber(tx) {
  const currentYear = new Date().getFullYear();

  // Find or create the counter record for the current year
  let counter = await tx.voucherCounter.findUnique({
    where: { year: currentYear }
  });

  if (!counter) {
    counter = await tx.voucherCounter.create({
      data: {
        year: currentYear,
        lastCount: 1
      }
    });
  } else {
    counter = await tx.voucherCounter.update({
      where: { year: currentYear },
      data: {
        lastCount: {
          increment: 1
        }
      }
    });
  }

  const paddedSequence = String(counter.lastCount).padStart(4, '0');
  return `VCH-${currentYear}-${paddedSequence}`;
}

module.exports = {
  generateVoucherNumber
};
