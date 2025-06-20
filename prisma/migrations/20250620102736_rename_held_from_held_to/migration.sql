/*
  Warnings:

  - You are about to drop the column `heldFrom` on the `Wrestler_Titles` table. All the data in the column will be lost.
  - You are about to drop the column `heldTo` on the `Wrestler_Titles` table. All the data in the column will be lost.
  - Added the required column `held_from` to the `Wrestler_Titles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wrestler_Titles" DROP COLUMN "heldFrom",
DROP COLUMN "heldTo",
ADD COLUMN     "held_from" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "held_to" TIMESTAMP(3);
