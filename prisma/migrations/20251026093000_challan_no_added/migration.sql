/*
  Warnings:

  - A unique constraint covering the columns `[challanNo]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `challanNo` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "challanNo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Job_challanNo_key" ON "Job"("challanNo");

-- CreateIndex
CREATE INDEX "Job_challanNo_idx" ON "Job"("challanNo");
