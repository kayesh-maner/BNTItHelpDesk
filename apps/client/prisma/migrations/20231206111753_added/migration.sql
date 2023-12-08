/*
  Warnings:

  - Added the required column `closeAt` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "closeAt" TIMESTAMP(3)  NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employeeType" TEXT DEFAULT 'Employee';
