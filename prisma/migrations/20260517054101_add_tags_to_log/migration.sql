-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
