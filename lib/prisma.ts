import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export let prisma: PrismaClient;

if (!globalForPrisma.prisma) {
  // PrismaNeon accepts PoolConfig, NOT a pool instance.
  const neonAdapter = new PrismaNeon(
    {
      connectionString: process.env.DB_URL!,
      max: 5,   // max pool connections
      min: 2,   // min pool connections
    },
    {
      // optional
      onPoolError: (err) => console.error("Neon Pool Error:", err),
    }
  );

  globalForPrisma.prisma = new PrismaClient({
    adapter: neonAdapter,
    log: ["warn", "error"],
  });
}

prisma = globalForPrisma.prisma;
