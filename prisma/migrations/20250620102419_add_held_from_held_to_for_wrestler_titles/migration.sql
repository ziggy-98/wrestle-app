/*
  Warnings:

  - Added the required column `heldFrom` to the `Wrestler_Titles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wrestler_Titles" ADD COLUMN     "heldFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "heldTo" TIMESTAMP(3);
