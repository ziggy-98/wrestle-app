/*
  Warnings:

  - Added the required column `date` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `debut` to the `Promotion_Wrestlers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Promotion_Wrestlers" ADD COLUMN     "debut" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "exit" TIMESTAMP(3);
